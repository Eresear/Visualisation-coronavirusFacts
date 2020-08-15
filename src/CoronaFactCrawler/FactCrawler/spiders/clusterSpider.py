# -*- coding: utf-8 -*-
import scrapy


class ClusterspiderSpider(scrapy.Spider):
    name = 'clusterSpider'
    allowed_domains = ['pudding.cool/misc/covid-fact-checker']
    start_urls = ['https://pudding.cool/misc/covid-fact-checker/data.csv']

    def parse(self, response):
       
        print("response",response)
        # self.driver.close()