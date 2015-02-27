# cogis
Screen scaping scripts for analyzing the Colorado state oil and gas spill reports website

    ./cogis.js 25 XTO
    Search Results code: 200
	{ id: 200400879, 'GW Impact?': false, 'Water spilled:': 5 }
	{ id: 2147973, 'GW Impact?': false, 'Water spilled:': 0 }
	{ id: 2147915, 'GW Impact?': false, 'Water spilled:': 42 }
	{ id: 2147807, 'GW Impact?': false, 'Water spilled:': 0 }
	{ id: 2147739, 'GW Impact?': true, 'Water spilled:': 3 }
	{ id: 200395810, 'GW Impact?': false, 'Water spilled:': 48 }
	{ id: 2147714, 'GW Impact?': false, 'Water spilled:': 35 }
	{ id: 200393953, 'GW Impact?': false, 'Water spilled:': 238 }
	{ id: 200392836, 'GW Impact?': false, 'Water spilled:': 30 }
	{ id: 2147035, 'GW Impact?': false, 'Water spilled:': 0 }
	{ id: 2146233, 'GW Impact?': false, 'Water spilled:': 0 }

## Screen scraping

There is a lot of data in the COGIS web pages, but there isn't much structure in the HTML source.

Most websites, we could use [Cheerio](https://matthewmueller.github.io/cheerio/) to screen scrape,
but for now we are writing a custom parser for COGIS.
