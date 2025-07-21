#!/usr/bin/env python3
"""
Test script for enhanced channel scanning functionality.
This script tests the new features for fetching total members, active members, and KOLs.
"""

import asyncio
import aiohttp
import json

async def test_enhanced_scan():
    """Test the enhanced scanning functionality"""
    
    # Test configuration
    BASE_URL = "http://localhost:8000"
    TEST_CHANNELS = [
        "btcgroupindia",  # Public crypto group
        "telegram",       # Official Telegram channel
        "durov"          # Pavel Durov's channel
    ]
    
    print("=== Testing Enhanced Channel Scanning ===\n")
    
    async with aiohttp.ClientSession() as session:
        # Test health endpoint first
        try:
            async with session.get(f"{BASE_URL}/health") as response:
                if response.status == 200:
                    print("✅ Telethon service is running")
                else:
                    print("❌ Telethon service health check failed")
                    return
        except Exception as e:
            print(f"❌ Cannot connect to Telethon service: {e}")
            return
        
        # Test scanning different channels
        for channel in TEST_CHANNELS:
            print(f"\n🔍 Scanning channel: {channel}")
            print("-" * 50)
            
            try:
                # Test without user authentication (should work for public channels)
                async with session.get(f"{BASE_URL}/scan/{channel}") as response:
                    if response.status == 200:
                        data = await response.json()
                        print_scan_results(data)
                    else:
                        error_text = await response.text()
                        print(f"❌ Scan failed (status {response.status}): {error_text}")
                        
            except Exception as e:
                print(f"❌ Error scanning {channel}: {e}")
        
        print("\n=== Test Summary ===")
        print("The enhanced scanning functionality includes:")
        print("• Total member count")
        print("• Active members count")
        print("• Admin count")
        print("• Bot count")
        print("• KOL detection and details")
        print("• Enhanced data flag to indicate successful detailed scan")

def print_scan_results(data):
    """Print formatted scan results with enhanced KOL analysis"""
    print(f"📊 Channel: {data.get('title', 'Unknown')}")
    print(f"👥 Total Members: {data.get('member_count', 0):,}")
    
    if data.get('enhanced_data', False):
        print("✅ Enhanced data available:")
        print(f"   🟢 Active Members: {data.get('active_members', 0):,}")
        print(f"   👑 Admins: {data.get('admin_count', 0)}")
        print(f"   🤖 Bots: {data.get('bot_count', 0)}")
        print(f"   ⭐ KOLs: {data.get('kol_count', 0)}")
        
        kols = data.get('kol_details', [])
        if kols:
            print("   🎯 KOL Analysis Results:")
            print("   " + "="*80)
            for i, kol in enumerate(kols[:5], 1):  # Show first 5 KOLs
                username = kol.get('username', 'No username')
                name = f"{kol.get('first_name', '')} {kol.get('last_name', '')}".strip()
                verified = "✅" if kol.get('is_verified', False) else ""
                admin = "👑" if kol.get('is_admin', False) else ""
                influence_score = kol.get('influence_score', 0)
                kol_type = kol.get('kol_type', 'member')
                
                # Engagement metrics
                crypto_signals = kol.get('crypto_signals', 0)
                message_count = kol.get('message_count', 0)
                leadership_indicators = kol.get('leadership_indicators', 0)
                engagement_received = kol.get('engagement_received', 0)
                wallet_mentions = kol.get('wallet_mentions', 0)
                cross_platform_refs = kol.get('cross_platform_refs', 0)
                
                print(f"   {i}. @{username} - {name} {verified} {admin}")
                print(f"      🔥 Influence Score: {influence_score}")
                print(f"      📝 Type: {kol_type.replace('_', ' ').title()}")
                print(f"      📊 Activity: {message_count} messages, {crypto_signals} crypto signals")
                print(f"      🎯 Leadership: {leadership_indicators} indicators, {engagement_received} replies")
                if wallet_mentions > 0:
                    print(f"      💰 Wallet mentions: {wallet_mentions}")
                if cross_platform_refs > 0:
                    print(f"      🔗 Cross-platform refs: {cross_platform_refs}")
                print()
    else:
        print("ℹ️  Basic data only (limited permissions)")
    
    print(f"📝 Recent Messages: {data.get('message_count', 0)}")
    print(f"✅ Verified: {data.get('verified', False)}")
    print()

if __name__ == "__main__":
    print("Starting enhanced scan test...")
    asyncio.run(test_enhanced_scan()) 