// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import axios from "axios";
import * as cheerio from "cheerio";
import type { NextApiRequest, NextApiResponse } from "next";
import iconv from "iconv-lite";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const keyword: any = req.query.keyword;

  const DOMAIN = "https://finance.naver.com";

  // HTML 크롤링 해오는 함수
  async function crawlingHTML(url: string) {
    const { data: html } = await axios({
      url: url,
      method: "GET",
      responseType: "arraybuffer",
    });
    const content = await iconv.decode(html, "EUC-KR").toString();
    return content;
  }

  // 회사 코드 크롤링 해오기
  const companyCode = [] as any[];
  for (let i = 0; i < 12; i++) {
    const companySelector = cheerio.load(
      await crawlingHTML(`${DOMAIN}/sise/sise_market_sum.naver?&page=${i + 1}`)
    );
    companySelector("tbody tr .center a").each((_, item) => {
      companyCode.push(companySelector(item).attr("href")?.slice(-6));
    });
  }

  //결과 값
  const result = [] as object[];
  companyCode.forEach((code) => {});
  for (let i = 0; i < companyCode.length; i++) {
    // DOM 조작을 위한 selector 설정
    const selector = cheerio.load(
      await crawlingHTML(`${DOMAIN}/item/news.naver?code=${companyCode[i]}`)
    );
    const iframeURL = `${DOMAIN}${selector("#news_frame").attr("src")}`;
    const selectorPostList = cheerio.load(await crawlingHTML(iframeURL));

    // 회사명
    const company = selector(".wrap_company a").text();

    // 제목
    selectorPostList(".tb_cont tbody tr").each((_, item) => {
      if (selectorPostList(item).text().trim().includes(keyword)) {
        result.push({
          company,
          title: selectorPostList(item).find(".title a").text().trim(),
          href: DOMAIN + selectorPostList(item).find(".title a").attr("href"),
          date: selectorPostList(item).find(".date").text().split(" ")[1],
        });
      }
    });
  }

  return res
    .setHeader("Access-Control-Allow-Origin", "*")
    .status(200)
    .json(result);
}
