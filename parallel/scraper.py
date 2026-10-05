import os
from firecrawl import FirecrawlApp

def scrape_creator_context(url: str) -> str:
    """Scrapes a URL and returns clean text to make our AI smarter."""
    try:
        # Connect to Firecrawl using your secret key
        app = FirecrawlApp(api_key=os.getenv("FIRECRAWL_API_KEY"))
        
        # Scrape the webpage and convert it to clean Markdown text
        scraped_data = app.scrape_url(url, params={'formats': ['markdown']})
        
        return scraped_data.get('markdown', '')
    except Exception as e:
        return f"Scraping failed: {e}"