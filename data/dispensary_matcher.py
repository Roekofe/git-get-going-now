#!/usr/bin/env python3
"""
Dispensary Data Matching Script
Matches Hoodie dispensary data with OLCC licensing data
"""

import csv
import re
from collections import defaultdict

def normalize_license(license_str):
    """Normalize license numbers to standard Oregon format"""
    if not license_str or license_str == 'Unspecified' or license_str.strip() == '':
        return None
    
    # Remove spaces, hashtags, quotes, and convert to uppercase
    license_clean = str(license_str).replace(' ', '').replace('#', '').replace('"', '').upper().strip()
    
    # Handle 050 format - add dash after 050 if missing
    if license_clean.startswith('050') and len(license_clean) > 3:
        if license_clean[3] != '-':
            license_clean = '050-' + license_clean[3:]
    
    # Handle cases where 050 is missing the leading zero: "50-XXXXXXXXX"
    if license_clean.startswith('50-') and len(license_clean) > 3:
        license_clean = '0' + license_clean
    
    return license_clean

def normalize_address(address_str):
    """Normalize addresses for matching"""
    if not address_str:
        return ""
    
    # Convert to uppercase and remove extra spaces
    addr = str(address_str).upper().strip()
    
    # Remove common prefixes/suffixes that might differ
    addr = re.sub(r',\s*USA$', '', addr)
    addr = re.sub(r',\s*OR\s*\d{5}.*$', '', addr)  # Remove OR zipcode
    
    # Standard abbreviations
    abbreviations = {
        'STREET': 'ST', 'AVENUE': 'AVE', 'BOULEVARD': 'BLVD',
        'DRIVE': 'DR', 'ROAD': 'RD', 'LANE': 'LN',
        'SUITE': 'STE', 'UNIT': 'UNIT', 'APARTMENT': 'APT',
        'HIGHWAY': 'HWY', 'PARKWAY': 'PKWY', 'NORTHWEST': 'NW',
        'NORTHEAST': 'NE', 'SOUTHWEST': 'SW', 'SOUTHEAST': 'SE',
        'NORTH': 'N', 'SOUTH': 'S', 'EAST': 'E', 'WEST': 'W'
    }
    
    for full, abbrev in abbreviations.items():
        addr = re.sub(r'\b' + full + r'\b', abbrev, addr)
    
    # Remove punctuation and normalize spaces
    addr = re.sub(r'[,.-]', ' ', addr)
    addr = re.sub(r'\s+', ' ', addr).strip()
    
    return addr

def extract_street_address(address_str):
    """Extract street number and name for partial matching"""
    if not address_str:
        return ""
    
    addr = normalize_address(address_str)
    # Extract first part before city/state
    parts = addr.split()
    if len(parts) >= 2:
        return ' '.join(parts[:3])  # Street number and name
    return addr

def read_csv_file(filepath, encoding='utf-8'):
    """Read CSV file with proper encoding handling"""
    encodings = ['utf-8', 'utf-8-sig', 'utf-16', 'latin-1']
    
    for enc in encodings:
        try:
            with open(filepath, 'r', encoding=enc, newline='') as file:
                # Try to read first line to test encoding
                first_line = file.readline()
                file.seek(0)
                
                # Try different delimiters
                sniffer = csv.Sniffer()
                sample = file.read(2048)
                file.seek(0)
                
                try:
                    delimiter = sniffer.sniff(sample).delimiter
                except:
                    delimiter = ','
                
                reader = csv.DictReader(file, delimiter=delimiter)
                data = list(reader)
                print(f"Successfully read {filepath} with encoding {enc} and delimiter '{delimiter}'")
                return data, reader.fieldnames
        except Exception as e:
            continue
    
    raise Exception(f"Could not read {filepath} with any encoding")

def main():
    print("Loading CSV files...")
    
    # Load Hoodie data
    hoodie_data, hoodie_headers = read_csv_file("/mnt/c/Users/travi/OneDrive/Desktop/Oregon Web Survey/Dispensaries - Carried (3).csv")
    print(f"Loaded {len(hoodie_data)} Hoodie dispensaries")
    print(f"Hoodie headers: {hoodie_headers}")
    
    # Load OLCC data
    olcc_data, olcc_headers = read_csv_file("/mnt/c/Users/travi/OneDrive/Desktop/Oregon Web Survey/Cannabis Business Licenses & Endorsements.csv")
    print(f"Loaded {len(olcc_data)} OLCC licenses")
    print(f"OLCC headers: {olcc_headers}")
    
    # Filter OLCC to only ACTIVE RECREATIONAL RETAILERS
    olcc_active = []
    for row in olcc_data:
        if (row.get('Status', '').strip() == 'ACTIVE' and 
            row.get('License Type', '').strip() == 'RECREATIONAL RETAILER'):
            olcc_active.append(row)
    
    print(f"Found {len(olcc_active)} active recreational retailers")
    
    # Create lookup dict for OLCC data by normalized license
    olcc_lookup = {}
    for row in olcc_active:
        license_norm = normalize_license(row.get('License Number', ''))
        if license_norm:
            olcc_lookup[license_norm] = row
    
    print(f"Created lookup for {len(olcc_lookup)} normalized OLCC licenses")
    
    # Normalize license numbers and show examples
    print("\nNormalizing license numbers...")
    examples_shown = 0
    
    # Fix header issue - remove BOM and quotes
    license_header = None
    for header in hoodie_headers:
        if 'License' in header:
            license_header = header
            break
    
    for row in hoodie_data:
        original = row.get(license_header, '')
        normalized = normalize_license(original)
        if examples_shown < 5:
            print(f"  {original} -> {normalized}")
            examples_shown += 1
        row['License_Normalized'] = normalized
    
    # Perform license-based matching
    print("\nPerforming license-based matching...")
    license_matches = 0
    for row in hoodie_data:
        license_norm = row.get('License_Normalized')
        if license_norm and license_norm in olcc_lookup:
            olcc_match = olcc_lookup[license_norm]
            row['OLCC_Business'] = olcc_match.get('Business Name', '')
            row['OLCC_Address'] = olcc_match.get('PhysicalAddress', '')
            row['OLCC_Status'] = olcc_match.get('Status', '')
            row['OLCC_License'] = olcc_match.get('License Number', '')
            row['Match_Type'] = 'License_Exact'
            row['Verification_Notes'] = 'Perfect license match'
            license_matches += 1
        else:
            row['Match_Type'] = 'No_Match'
            row['Verification_Notes'] = 'Not found in OLCC database'
    
    print(f"License matches: {license_matches} out of {len(hoodie_data)} ({license_matches/len(hoodie_data)*100:.1f}%)")
    
    # Address-based matching for unmatched records
    print("\nPerforming address-based matching...")
    unmatched_rows = [row for row in hoodie_data if row['Match_Type'] == 'No_Match']
    
    # Create address lookup for OLCC data
    olcc_address_lookup = {}
    olcc_street_lookup = defaultdict(list)
    
    for row in olcc_active:
        addr_norm = normalize_address(row.get('PhysicalAddress', ''))
        street_addr = extract_street_address(row.get('PhysicalAddress', ''))
        
        if addr_norm:
            olcc_address_lookup[addr_norm] = row
        if street_addr:
            olcc_street_lookup[street_addr].append(row)
    
    # Get address and dispensary headers
    address_header = None
    dispensary_header = None
    for header in hoodie_headers:
        if 'Address' in header:
            address_header = header
        elif 'Dispensary' in header:
            dispensary_header = header
    
    address_matches = 0
    for row in unmatched_rows:
        hoodie_addr = normalize_address(row.get(address_header, ''))
        
        hoodie_name = row.get(dispensary_header, '').upper().strip()
        
        # Try exact address match first
        if hoodie_addr and hoodie_addr in olcc_address_lookup:
            olcc_match = olcc_address_lookup[hoodie_addr]
            olcc_name = olcc_match.get('Business Name', '').upper().strip()
            
            row['OLCC_Business'] = olcc_match.get('Business Name', '')
            row['OLCC_Address'] = olcc_match.get('PhysicalAddress', '')
            row['OLCC_Status'] = olcc_match.get('Status', '')
            row['OLCC_License'] = olcc_match.get('License Number', '')  # Capture OLCC license
            
            # Check if business names are similar for better match type
            if hoodie_name and olcc_name and (hoodie_name in olcc_name or olcc_name in hoodie_name):
                row['Match_Type'] = 'Address_Name'
                row['Verification_Notes'] = 'Same address + business name, different license'
            else:
                row['Match_Type'] = 'Address_Only'
                row['Verification_Notes'] = 'Same address, different business name/license'
            
            address_matches += 1
            continue
        
        # Try partial street matching
        hoodie_street = extract_street_address(row.get(address_header, ''))
        if hoodie_street and hoodie_street in olcc_street_lookup:
            olcc_match = olcc_street_lookup[hoodie_street][0]  # Take first match
            olcc_name = olcc_match.get('Business Name', '').upper().strip()
            
            row['OLCC_Business'] = olcc_match.get('Business Name', '')
            row['OLCC_Address'] = olcc_match.get('PhysicalAddress', '')
            row['OLCC_Status'] = olcc_match.get('Status', '')
            row['OLCC_License'] = olcc_match.get('License Number', '')  # Capture OLCC license
            
            # Check if business names are similar
            if hoodie_name and olcc_name and (hoodie_name in olcc_name or olcc_name in hoodie_name):
                row['Match_Type'] = 'Address_Name'
                row['Verification_Notes'] = 'Same street + business name, different license'
            else:
                row['Match_Type'] = 'Address_Partial'
                row['Verification_Notes'] = 'Same street address, different business/license'
            
            address_matches += 1
    
    print(f"Address matches: {address_matches} additional matches found")
    
    # Create final export dataset
    print("\nCreating final export...")
    export_data = []
    
    # Fix header issues
    dispensary_header = None
    address_header = None
    hoodie_id_header = None
    
    for header in hoodie_headers:
        if 'Dispensary' in header:
            dispensary_header = header
        elif 'Address' in header:
            address_header = header
        elif 'Hoodie ID' in header:
            hoodie_id_header = header
    
    for row in hoodie_data:
        # Create survey display name
        dispensary_name = row.get(dispensary_header, '')
        address = row.get(address_header, '')
        street_part = address.split(',')[0] if address else 'Unknown'
        display_name = f"{dispensary_name} - {street_part}"
        
        # Determine verified license - prefer OLCC license when available
        hoodie_license = row.get('License_Normalized', '')
        olcc_license = row.get('OLCC_License', '')
        verified_license = olcc_license if olcc_license else hoodie_license
        
        # Smart confidence scoring
        match_type = row.get('Match_Type', 'No_Match')
        if match_type == 'License_Exact':
            confidence = 'High'
        elif match_type == 'Address_Name':
            confidence = 'Medium_High'
        elif match_type in ['Address_Only', 'Address_Partial']:
            confidence = 'Medium'
        else:
            confidence = 'Low'
        
        is_verified = 'Yes' if match_type != 'No_Match' else 'No'
        
        export_row = {
            'Survey_Display_Name': display_name,
            'Hoodie_ID': row.get(hoodie_id_header, ''),
            'Hoodie_License': hoodie_license,
            'Verified_License': verified_license,
            'OLCC_Business_Name': row.get('OLCC_Business', ''),
            'Match_Type': match_type,
            'Verification_Notes': row.get('Verification_Notes', ''),
            'Confidence_Score': confidence,
            'Is_Verified': is_verified
        }
        export_data.append(export_row)
    
    # Sort alphabetically by display name
    export_data.sort(key=lambda x: x['Survey_Display_Name'])
    
    # Export to CSV
    output_path = "/mnt/c/Users/travi/OneDrive/Desktop/Oregon Web Survey/dispensary_survey_master.csv"
    with open(output_path, 'w', newline='', encoding='utf-8') as csvfile:
        fieldnames = ['Survey_Display_Name', 'Hoodie_ID', 'Hoodie_License', 'Verified_License', 
                     'OLCC_Business_Name', 'Match_Type', 'Verification_Notes', 'Confidence_Score', 'Is_Verified']
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(export_data)
    
    print(f"Exported to: {output_path}")
    
    # Summary statistics
    total_dispensaries = len(export_data)
    verified_count = len([row for row in export_data if row['Is_Verified'] == 'Yes'])
    verification_rate = verified_count / total_dispensaries * 100 if total_dispensaries > 0 else 0
    
    print(f"\n=== SUMMARY STATISTICS ===")
    print(f"Total dispensaries: {total_dispensaries}")
    print(f"Verified dispensaries: {verified_count}")
    print(f"Verification rate: {verification_rate:.1f}%")
    
    # Confidence and match type breakdown
    confidence_counts = defaultdict(int)
    match_counts = defaultdict(int)
    
    for row in export_data:
        confidence_counts[row['Confidence_Score']] += 1
        match_counts[row['Match_Type']] += 1
    
    print(f"\nSmart Verification Results:")
    print(f"\nConfidence breakdown:")
    for confidence in ['High', 'Medium_High', 'Medium', 'Low']:
        count = confidence_counts[confidence]
        if count > 0:
            print(f"  {confidence}: {count} ({count/total_dispensaries*100:.1f}%)")
    
    print(f"\nMatch type breakdown:")
    for match_type, count in sorted(match_counts.items()):
        print(f"  {match_type}: {count}")
    
    # Calculate weighted verification rate
    weighted_total = 0
    for row in export_data:
        if row['Confidence_Score'] == 'High':
            weighted_total += 1.0
        elif row['Confidence_Score'] == 'Medium_High':
            weighted_total += 0.95
        elif row['Confidence_Score'] == 'Medium':
            weighted_total += 0.85
        elif row['Confidence_Score'] == 'Low':
            weighted_total += 0.5
    
    weighted_rate = weighted_total / total_dispensaries * 100
    print(f"\nWeighted verification rate: {weighted_rate:.1f}% (accounts for confidence levels)")
    
    return export_data

if __name__ == "__main__":
    result = main()