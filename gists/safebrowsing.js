// export PATH=$PATH:$GOPATH/bin
// go run .\safebrowsing\cmd\sbserver\main.go -apikey $SAFE_BROWSING_GCP_API_KEY

// POST! 127.0.0.1:8080/v4/threatMatches:find
// {
// 	"threatInfo": {
// 		"threatTypes":      ["UNWANTED_SOFTWARE", "MALWARE"],
// 		"platformTypes":    ["ANY_PLATFORM"],
// 		"threatEntryTypes": ["URL"],
// 		"threatEntries": [
// 			{"url": "google.com"},
// 			{"url": "yahoo.com"}
// 		]
// 	}
// }
