# -*- coding: utf-8 -*-
import scrapy
import datetime

class CoronavirusfactsSpider(scrapy.Spider):
    name = 'CoronaVirusFacts'
    allowed_domains = ['www.poynter.org/ifcn-covid-19-misinformation/']
    start_urls = ['https://www.poynter.org/ifcn-covid-19-misinformation/']
   
    def parse(self, response):
       
        #get all artcile url in page 1
        article_urls =  response.xpath("//article/div/div/a/@href").extract()   
        for url in article_urls:
            yield scrapy.Request(url, callback=self.parse_article,dont_filter=True)
        
        next_page_url = response.xpath('//div[@class="nav-links"]/a[@class="next page-numbers"]/@href').extract_first()  
        print("next page url ",next_page_url)
        # numbers = next_page_url.split("/")
        # stop = False
        # for num in numbers:
        #     if num.isdigit():
        #         if num =="538":
        #             stop=True

        if next_page_url is None:
            pass
        else:
            yield scrapy.Request(next_page_url, callback=self.parse,dont_filter=True)

      

    def parse_article(self, response):
        ##Fact-checked by: Agência Lupa
        organization = response.xpath("//article/div/header/p[1]/text()").get() 
        organization = organization.split(":")
        organization = organization[1].strip()
        #'2020/07/10 | Brazil'
        date_countries = response.xpath("//article/div/header/p[2]/strong/text()").get() 
        dc  = date_countries.split("|")
        date = dc[0].strip()
        date = datetime.datetime.strptime(date, '%Y/%m/%d').strftime('%m/%d/%Y')
        date = date.lstrip("0")

        countries = dc[1].lstrip()
        countries = countries.replace(" ", "")
        countryArray = countries.split(",")
        country=["","","",""]
        for i in range(len(countryArray)):
            if i<=3:
                country[i] = countryArray[i].strip()
        # FALSE:
        finalRate = response.xpath("//article/div/header/h1/span/text()").get()  
        #remove : 
        finalRate = finalRate.translate({ord(i):None for i in ':'})
        #' While everyone was worried about COVID-19, the Chamber of Deputies approved two bills which legalize abortion.\t\t'
        what_did_checked = response.xpath("//article/div/header/h1//text()[2]").get() 
        what_did_checked = what_did_checked.strip()
        #"Explanation: The two mentioned bills have nothing to do with abortion. They're about protecting victims of domestic abuse and violence during the pandemic. Abortion is not mentioned."
        explanation = response.xpath("//article/div/div/div/p/text()").get() 
        explanation = explanation.split(":")
        explanation = explanation[1].strip()
        #['https://piaui.folha.uol.com.br/lupa/2020/07/11/verificamos-aborto-pandemia/']
        check_url = response.xpath("//article/div/div/div/a/@href").extract() 
        #'This false claim originated from: Facebook' 
        who_said = response.xpath("//article/div/div/div/p[2]/text()").get() 
        who_said = who_said.split(":")
        who_said = who_said[1].strip()
        yield {
            'When did you see the claim?': date,
            'Country 1': country[0],
            'Country 2': country[1],
            'Country 3': country[2],
            'Country 4': country[3],
            'Countries': countries,
            'Organization': organization,
            'What did you fact-check?': what_did_checked,
            'Who said/posted it?': who_said,
            'Link to the original piece':"",
            'URL to fact-checked article (in your language)': check_url,
            'Language of your fact-check': "English",
            'Explanation': explanation,
            'Final rating': finalRate,
            'Category': "",
        }
