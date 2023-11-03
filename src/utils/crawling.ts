import axios from "axios";
import * as cheerio from "cheerio";
import iconv from "iconv-lite";

export async function crawling(keyword: string) {
  const DOMAIN = "https://finance.naver.com";

  // HTML 크롤링 해오는 함수
  async function crawlingHTML(url: string) {
    const { data: html } = await axios({
      url: url,
      method: "GET",
      responseType: "arraybuffer",
      withCredentials: true,
    });
    const content = await iconv.decode(html, "EUC-KR").toString();
    return content;
  }

  // 회사 코드
  const companyCode = [] as any[];
  for (let i = 0; i < 2; i++) {
    const companySelector = cheerio.load(
      await crawlingHTML(`${DOMAIN}/sise/sise_market_sum.naver?&page=${i + 1}`)
    );
    companySelector("tbody tr .center a").each((_, item) => {
      companyCode.push(companySelector(item).attr("href")?.slice(-6));
    });
  }

  interface IData {
    company: string;
    title: string;
    href: string;
    date: string;
  }

  //결과 값
  const result = [] as IData[];
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

  // 회사 수 설정 할 수 있게 => page 수
  // 코스닥 코스피 선택 할 수 있게
  return result;
}
