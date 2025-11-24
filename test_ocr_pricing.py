#!/usr/bin/env python3
"""Test OCR pricing against all floor plans."""
import requests
import base64
import os
from pathlib import Path

API_URL = "https://kgvilla-backend-30314481610.europe-north1.run.app"

def test_floor_plan(filepath: str) -> dict:
    """Analyze a single floor plan and return results."""
    ext = Path(filepath).suffix.lower()
    mime_type = 'image/png' if ext == '.png' else 'image/jpeg'

    with open(filepath, 'rb') as f:
        files = {'file': (Path(filepath).name, f, mime_type)}
        headers = {'X-API-Key': 'dev-key-12345'}
        response = requests.post(
            f"{API_URL}/analyze",
            files=files,
            headers=headers,
            timeout=120
        )

    if response.status_code != 200:
        return {"error": response.text}

    data = response.json()
    items = data.get("items", [])
    total_cost = sum(item.get("totalCost", 0) for item in items)

    return {
        "filename": Path(filepath).name,
        "totalArea": data.get("totalArea", 0),
        "roomCount": len(data.get("rooms", [])),
        "itemCount": len(items),
        "totalCost": total_cost,
        "costPerM2": total_cost / data.get("totalArea", 1) if data.get("totalArea", 0) > 0 else 0
    }

def main():
    floor_plans = [
        "/Users/sameerm4/Desktop/KGVilla/1324.png",
        "/Users/sameerm4/Desktop/KGVilla/1328.jpg",
        "/Users/sameerm4/Desktop/KGVilla/1329.jpg",
        "/Users/sameerm4/Desktop/KGVilla/1334.jpg",
        "/Users/sameerm4/Desktop/KGVilla/1347.jpg",
        "/Users/sameerm4/Desktop/KGVilla/1352.jpg",
        "/Users/sameerm4/Desktop/KGVilla/1355.png",
        "/Users/sameerm4/Desktop/KGVilla/1369.jpg",
        "/Users/sameerm4/Desktop/KGVilla/1405.jpg",
    ]

    print("=" * 90)
    print(f"{'File':<12} {'Area (m²)':<12} {'Rooms':<8} {'Items':<8} {'Total Cost (kr)':<18} {'kr/m²':<12}")
    print("=" * 90)

    results = []
    for fp in floor_plans:
        if os.path.exists(fp):
            result = test_floor_plan(fp)
            results.append(result)

            if "error" in result:
                print(f"{Path(fp).name:<12} ERROR: {result['error'][:50]}")
            else:
                print(f"{result['filename']:<12} {result['totalArea']:<12.1f} {result['roomCount']:<8} {result['itemCount']:<8} {result['totalCost']:>15,.0f} {result['costPerM2']:>10,.0f}")

    print("=" * 90)

    # Summary
    valid = [r for r in results if "error" not in r]
    if valid:
        avg_cost_per_m2 = sum(r['costPerM2'] for r in valid) / len(valid)
        print(f"\nAverage cost per m²: {avg_cost_per_m2:,.0f} kr")
        print(f"Target range: 25,000 - 35,000 kr/m² for turnkey")

if __name__ == "__main__":
    main()
