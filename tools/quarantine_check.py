#!/usr/bin/env python3
"""
=============================================================================
QUARANTINE IMPORT SCANNER
=============================================================================
Build-time enforcement of the GOVERNED/UNGOVERNED namespace boundary.

KERNEL INVARIANT:
    Code in src/governed/ MUST NOT import from src/ungoverned/
    
This scanner detects forbidden imports at build time and FAILS the build
if any quarantine violations are found.

USAGE:
    python tools/quarantine_check.py [--strict] [--fix]
    
EXIT CODES:
    0 - No violations found
    1 - Violations found (build should fail)
    2 - Scanner error

CONSTITUTIONAL BASIS:
    Article 50: Martial Governance
    - Ungoverned code is liability-isolated
    - Integration requires explicit Senate review
    - Mechanical enforcement, not symbolic warnings
=============================================================================
"""

import ast
import os
import sys
import re
from pathlib import Path
from dataclasses import dataclass
from typing import List, Set, Tuple, Optional
import argparse
import json
from datetime import datetime


# =============================================================================
# CONFIGURATION
# =============================================================================

# Forbidden import patterns (governed cannot import from these)
FORBIDDEN_PATTERNS = [
    r"from\s+src\.ungoverned",
    r"import\s+src\.ungoverned",
    r"from\s+\.\.ungoverned",
    r"from\s+ungoverned",
]

# Compile patterns for efficiency
FORBIDDEN_REGEX = [re.compile(p, re.MULTILINE) for p in FORBIDDEN_PATTERNS]

# Namespace definitions
GOVERNED_NAMESPACE = "src/governed"
UNGOVERNED_NAMESPACE = "src/ungoverned"


# =============================================================================
# DATA STRUCTURES
# =============================================================================

@dataclass
class QuarantineViolation:
    """Represents a single quarantine violation."""
    file_path: str
    line_number: int
    line_content: str
    import_target: str
    severity: str = "CRITICAL"
    
    def to_dict(self) -> dict:
        return {
            "file": self.file_path,
            "line": self.line_number,
            "content": self.line_content.strip(),
            "target": self.import_target,
            "severity": self.severity
        }
    
    def __str__(self) -> str:
        return (
            f"  ❌ {self.file_path}:{self.line_number}\n"
            f"     {self.line_content.strip()}\n"
            f"     → Forbidden import from UNGOVERNED namespace"
        )


@dataclass 
class ScanResult:
    """Results of a quarantine scan."""
    violations: List[QuarantineViolation]
    files_scanned: int
    scan_time_ms: float
    
    @property
    def is_clean(self) -> bool:
        return len(self.violations) == 0
    
    def to_report(self) -> str:
        lines = [
            "=" * 72,
            "QUARANTINE SCAN REPORT",
            "=" * 72,
            f"Timestamp: {datetime.now().isoformat()}",
            f"Files scanned: {self.files_scanned}",
            f"Scan time: {self.scan_time_ms:.2f}ms",
            f"Status: {'✅ CLEAN' if self.is_clean else '❌ VIOLATIONS FOUND'}",
            ""
        ]
        
        if not self.is_clean:
            lines.append(f"VIOLATIONS ({len(self.violations)}):")
            lines.append("-" * 72)
            for v in self.violations:
                lines.append(str(v))
                lines.append("")
            
            lines.extend([
                "=" * 72,
                "BUILD FAILED: Quarantine boundary violated",
                "",
                "RESOLUTION:",
                "  1. Remove the forbidden import",
                "  2. If ungoverned code is needed, use proper Article 50 channels",
                "  3. Never integrate UNGOVERNED code into GOVERNED modules",
                "=" * 72
            ])
        else:
            lines.extend([
                "=" * 72,
                "BUILD PASSED: Quarantine boundary intact",
                "=" * 72
            ])
        
        return "\n".join(lines)


# =============================================================================
# AST-BASED IMPORT ANALYSIS
# =============================================================================

class ImportAnalyzer(ast.NodeVisitor):
    """
    AST visitor that extracts all imports from a Python file.
    More reliable than regex for complex import statements.
    """
    
    def __init__(self):
        self.imports: List[Tuple[int, str, str]] = []  # (line, type, target)
    
    def visit_Import(self, node: ast.Import):
        for alias in node.names:
            self.imports.append((node.lineno, "import", alias.name))
        self.generic_visit(node)
    
    def visit_ImportFrom(self, node: ast.ImportFrom):
        module = node.module or ""
        # Handle relative imports
        if node.level > 0:
            module = "." * node.level + module
        self.imports.append((node.lineno, "from", module))
        self.generic_visit(node)


def analyze_imports_ast(file_path: Path) -> List[Tuple[int, str, str]]:
    """
    Parse a Python file and extract all imports using AST.
    Falls back to regex if AST parsing fails.
    """
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        tree = ast.parse(content)
        analyzer = ImportAnalyzer()
        analyzer.visit(tree)
        return analyzer.imports
    except SyntaxError:
        # Fall back to regex for files with syntax errors
        return []


def is_ungoverned_import(import_target: str) -> bool:
    """Check if an import target refers to the ungoverned namespace."""
    ungoverned_markers = [
        "src.ungoverned",
        "ungoverned.",
        ".ungoverned",
    ]
    return any(marker in import_target for marker in ungoverned_markers)


# =============================================================================
# FILE SCANNING
# =============================================================================

def find_python_files(directory: Path) -> List[Path]:
    """Find all Python files in a directory recursively."""
    return list(directory.rglob("*.py"))


def scan_file_for_violations(
    file_path: Path,
    governed_root: Path
) -> List[QuarantineViolation]:
    """
    Scan a single file for quarantine violations.
    Uses both AST analysis and regex patterns.
    """
    violations = []
    
    # Read file content
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
            content = "".join(lines)
    except Exception as e:
        print(f"Warning: Could not read {file_path}: {e}", file=sys.stderr)
        return violations
    
    # Method 1: AST-based analysis
    imports = analyze_imports_ast(file_path)
    for line_no, import_type, target in imports:
        if is_ungoverned_import(target):
            violations.append(QuarantineViolation(
                file_path=str(file_path.relative_to(governed_root.parent.parent)),
                line_number=line_no,
                line_content=lines[line_no - 1] if line_no <= len(lines) else "",
                import_target=target
            ))
    
    # Method 2: Regex-based analysis (catches edge cases)
    for i, line in enumerate(lines, 1):
        for pattern in FORBIDDEN_REGEX:
            if pattern.search(line):
                # Avoid duplicates from AST analysis
                if not any(v.line_number == i for v in violations):
                    match = pattern.search(line)
                    violations.append(QuarantineViolation(
                        file_path=str(file_path.relative_to(governed_root.parent.parent)),
                        line_number=i,
                        line_content=line,
                        import_target=match.group(0) if match else "unknown"
                    ))
    
    return violations


def scan_governed_namespace(project_root: Path) -> ScanResult:
    """
    Scan the entire governed namespace for quarantine violations.
    """
    import time
    start_time = time.time()
    
    governed_path = project_root / GOVERNED_NAMESPACE
    
    if not governed_path.exists():
        print(f"Warning: Governed namespace not found at {governed_path}")
        return ScanResult(violations=[], files_scanned=0, scan_time_ms=0)
    
    python_files = find_python_files(governed_path)
    all_violations = []
    
    for file_path in python_files:
        violations = scan_file_for_violations(file_path, governed_path)
        all_violations.extend(violations)
    
    end_time = time.time()
    scan_time_ms = (end_time - start_time) * 1000
    
    return ScanResult(
        violations=all_violations,
        files_scanned=len(python_files),
        scan_time_ms=scan_time_ms
    )


# =============================================================================
# EXTENDED SCANNING: Check entire src/ for accidental ungoverned imports
# =============================================================================

def scan_all_source(project_root: Path) -> ScanResult:
    """
    Extended scan: Check ALL source files outside ungoverned namespace.
    This catches cases where non-governed code accidentally imports ungoverned.
    """
    import time
    start_time = time.time()
    
    src_path = project_root / "src"
    ungoverned_path = project_root / UNGOVERNED_NAMESPACE
    
    if not src_path.exists():
        return ScanResult(violations=[], files_scanned=0, scan_time_ms=0)
    
    all_python_files = find_python_files(src_path)
    
    # Exclude files IN the ungoverned namespace (they can import each other)
    clean_files = [
        f for f in all_python_files
        if not str(f).startswith(str(ungoverned_path))
    ]
    
    all_violations = []
    for file_path in clean_files:
        violations = scan_file_for_violations(file_path, src_path)
        all_violations.extend(violations)
    
    end_time = time.time()
    scan_time_ms = (end_time - start_time) * 1000
    
    return ScanResult(
        violations=all_violations,
        files_scanned=len(clean_files),
        scan_time_ms=scan_time_ms
    )


# =============================================================================
# CLI INTERFACE
# =============================================================================

def main():
    parser = argparse.ArgumentParser(
        description="Quarantine Import Scanner - Enforce GOVERNED/UNGOVERNED boundary",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
CONSTITUTIONAL BASIS:
  Article 50: Martial Governance requires mechanical isolation of
  ungoverned code. This scanner enforces that boundary at build time.

EXAMPLES:
  python tools/quarantine_check.py              # Scan governed/ namespace
  python tools/quarantine_check.py --strict     # Scan all source files
  python tools/quarantine_check.py --json       # Output as JSON
        """
    )
    
    parser.add_argument(
        "--strict",
        action="store_true",
        help="Scan ALL source files, not just governed/"
    )
    
    parser.add_argument(
        "--json",
        action="store_true",
        help="Output results as JSON"
    )
    
    parser.add_argument(
        "--project-root",
        type=Path,
        default=Path(__file__).parent.parent,
        help="Project root directory (default: parent of tools/)"
    )
    
    parser.add_argument(
        "--ci",
        action="store_true",
        help="CI mode: minimal output, strict exit codes"
    )
    
    args = parser.parse_args()
    
    # Run the appropriate scan
    if args.strict:
        result = scan_all_source(args.project_root)
    else:
        result = scan_governed_namespace(args.project_root)
    
    # Output results
    if args.json:
        output = {
            "status": "clean" if result.is_clean else "violated",
            "files_scanned": result.files_scanned,
            "scan_time_ms": result.scan_time_ms,
            "violations": [v.to_dict() for v in result.violations]
        }
        print(json.dumps(output, indent=2))
    elif args.ci:
        if not result.is_clean:
            print(f"❌ QUARANTINE VIOLATED: {len(result.violations)} forbidden imports")
            for v in result.violations:
                print(f"  {v.file_path}:{v.line_number}")
            sys.exit(1)
        else:
            print(f"✅ Quarantine intact ({result.files_scanned} files scanned)")
    else:
        print(result.to_report())
    
    # Exit with appropriate code
    sys.exit(0 if result.is_clean else 1)


if __name__ == "__main__":
    main()
