"""Package the public skill only; no third-party Python dependencies."""
import argparse
from pathlib import Path
from zipfile import ZipFile, ZipInfo, ZIP_DEFLATED

ROOT = Path(__file__).resolve().parents[1]
INCLUDE = ('SKILL.md', 'README.md', 'agents', 'assets', 'references', 'scripts', 'masters/neutral')
SKIP = {'.DS_Store', '__pycache__', 'node_modules', '.git'}

def package(output):
    files = []
    for name in INCLUDE:
        item = ROOT / name
        if not item.exists():
            raise FileNotFoundError(item)
        for p in ([item] if item.is_file() else sorted(item.rglob('*'))):
            rel = p.relative_to(ROOT)
            if any(part in SKIP for part in rel.parts) or p.suffix == '.pyc':
                continue
            if p.is_symlink():
                raise ValueError(f'Symlink not allowed in public package: {rel}')
            if p.is_file():
                files.append(p)
    output = Path(output).resolve()
    if output in files:
        raise ValueError('Output must be outside packaged input files')
    output.parent.mkdir(parents=True, exist_ok=True)
    with ZipFile(output, 'w', compression=ZIP_DEFLATED) as archive:
        for p in sorted(files):
            name = 'business-slides/' + p.relative_to(ROOT).as_posix()
            info = ZipInfo(name, date_time=(1980, 1, 1, 0, 0, 0))
            info.compress_type = ZIP_DEFLATED
            info.external_attr = 0o100644 << 16
            archive.writestr(info, p.read_bytes())
    with ZipFile(output) as archive:
        assert archive.testzip() is None
        assert 'business-slides/SKILL.md' in archive.namelist()
        assert not any('/masters/' in n and '/masters/neutral/' not in n for n in archive.namelist())
    print(f'{output}: {len(files)} files, {output.stat().st_size:,} bytes')

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--out', required=True)
    package(parser.parse_args().out)
