#!/usr/bin/env python3
"""
Test script for Hardcover API integration
Run this after updating your .env file with the complete API key
"""

import asyncio
import sys
import os
import pytest

# Add the backend directory to the path
sys.path.append(os.path.dirname(__file__))

from app.services.hardcover_service import HardcoverService

@pytest.mark.asyncio
async def test_hardcover_integration():
    """Test the Hardcover API integration"""
    print("🧪 Testing Hardcover API Integration")
    print("=" * 50)
    
    service = HardcoverService()
    
    # Test 1: Health Check
    print("\n1. Testing API Health Check...")
    health = await service.health_check()
    print(f"   Status: {health['status']}")
    print(f"   API Accessible: {health['api_accessible']}")
    if health['status'] == 'unhealthy':
        print(f"   Error: {health['error']}")
        print("\n❌ API health check failed. Please check your API key.")
        return
    else:
        print(f"   Response Time: {health['response_time']:.3f}s")
        print("   ✅ API health check passed!")
    
    # Test 2: Book Search
    print("\n2. Testing Book Metadata Retrieval...")
    test_books = [
        ("The Hobbit", "J.R.R. Tolkien"),
        ("Dune", "Frank Herbert"),
        ("1984", "George Orwell"),
    ]
    
    for title, author in test_books:
        print(f"\n   Searching for: '{title}' by {author}")
        metadata = await service.get_book_metadata(title, author)
        
        if metadata:
            print(f"   ✅ Found: {metadata.get('title', 'Unknown Title')}")
            print(f"      Author: {metadata.get('author', 'Unknown Author')}")
            print(f"      Cover URL: {'✅ Available' if metadata.get('cover_url') else '❌ Not found'}")
            print(f"      Rating: {metadata.get('rating', 'N/A')}")
            print(f"      Hardcover URL: {'✅ Available' if metadata.get('url') else '❌ Not found'}")
            print(f"      Publisher: {metadata.get('publisher', 'N/A')}")
            print(f"      Pages: {metadata.get('page_count', 'N/A')}")
        else:
            print(f"   ❌ No metadata found for '{title}'")
    
    print("\n" + "=" * 50)
    print("🎉 Test completed!")
    print("\nIf you see cover URLs and other metadata, the integration is working correctly.")
    print("If not, please check your Hardcover API key in the .env file.")

if __name__ == "__main__":
    asyncio.run(test_hardcover_integration())
