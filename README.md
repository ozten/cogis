# cogis
Screen scaping scripts for analyzing the Colorado state oil and gas spill reports website

    ./cogis.js 25 XTO
    # id, Date of Incident:, Oil spilled:, GW Impact?, Water spilled:, Other spilled:, Surface water impact?, Cause of spill:
	200400879, 3/30/2014, 0, false, 5, 0, false, EQUIPMENT FAILURE
	2147973, 3/16/2014, 15, false, 0, , false, EQUIPMENT FAILURE
	2147915, 3/3/2014, , false, 42, , false, EQUIPMENT FAILURE
	2147807, N/A, , false, 0, , false, COMPROMISED PIT LINER
	2147739, 2/4/2013, , true, 3, , false, EQUIPMENT FAILURE
	200395810, 2/7/2014, 0, false, 48, 0, false, EQUIPMENT FAILURE
	2147714, 2/2/2014, , false, 35, , false, EQUIPMENT FAILIURE
	200393953, 1/16/2014, 0, false, 238, 0, true, HUMAN ERROR
	200392836, 12/10/2013, 0, false, 30, 0, false, FREEZE OF LINE
	2147035, 9/25/2013, 9, false, 0, , false, HUMAN ERROR
	2146233, N/A, , false, 0, , false, COMPROMISED PIT LINER

## Screen scraping

There is a lot of data in the COGIS web pages, but there isn't much structure in the HTML source.

Most websites, we could use [Cheerio](https://matthewmueller.github.io/cheerio/) to screen scrape,
but for now we are writing a custom parser for COGIS.
