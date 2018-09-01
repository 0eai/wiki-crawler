var request = require('request');
var cheerio = require('cheerio');
var URL = require('url-parse');
const fs = require('fs');

var START_URL = "https://en.wikipedia.org/wiki/Web_crawler";
var pagesVisited = {};
var numPagesVisited = 0;
var pagesToVisit = [];
var url = new URL(START_URL);
var baseUrl = "https://en.wikipedia.org";

pagesToVisit.push(START_URL);
crawl();

function crawl() {
  var nextPage = pagesToVisit.pop();
  if (nextPage in pagesVisited) {
    crawl();
  } else {
    visitPage(nextPage, crawl);
  }
}

function visitPage(url, callback) {
  pagesVisited[url] = true;
  numPagesVisited++;
  console.log("Visiting page " + url);
  request(url, function(error, response, html) {
     console.log("Status code: " + response.statusCode);
     if(response.statusCode !== 200) {
       callback();
       return;
     }
     var $ = cheerio.load(html);
     var title = $("title").text();
     var p = $('p').eq(0).text();
     let result = {  
        title: title,
        text: p
     };
      console.log(result);
      console.log("\n\n");
      console.log("Number of Pages Visited : " + numPagesVisited);
      collectInternalLinks($);
      callback();
  });
}

function collectInternalLinks($) {
    var relativeLinks = $("a[href^='/']");
    console.log("Found " + relativeLinks.length + " relative links on page");
    relativeLinks.each(function() {
        if ($(this).attr('href').startsWith("/wiki/") && $(this).attr('href').search(":") == -1 && $(this).attr('href').search("Main_Page") == -1) {
            pagesToVisit.push(baseUrl + $(this).attr('href'));
          //console.log(baseUrl + $(this).attr('href'));
            }
    });
}
