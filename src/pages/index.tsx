import axios from "axios";
import Head from "next/head";
import Link from "next/link";
import { ChangeEvent, FormEvent, useState } from "react";
import Parser from "html-react-parser";

interface IData {
  company: string;
  title: string;
  href: string;
  date: string;
}

export default function Home() {
  const [value, setValue] = useState("");
  const [keyWord, setKeyWord] = useState("");
  const [data, setData] = useState<IData[]>([]);
  const [loading, setLoading] = useState(false);

  const onClick = async () => {
    if (value.trim() === "") return setValue("");
    setKeyWord(value);
    setData([]);
    setLoading(true);

    const data = await getFetchData(value, "1");
    setData((prev) => [...prev, ...data]);
    const data2 = await getFetchData(value, "2");
    setData((prev) => [...prev, ...data2]);
    const data3 = await getFetchData(value, "3");
    setData((prev) => [...prev, ...data3]);

    setLoading(false);
    setValue("");
  };

  return (
    <>
      <Head>
        <title>뉴스 크롤링 사이트</title>
        <meta
          name="description"
          content="150개의 기업 뉴스 정보를 제공합니다."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="container">
        <div className="search_container">
          <form onSubmit={(e: FormEvent) => e.preventDefault()}>
            <input
              value={value}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setValue(e.target.value)
              }
              placeholder="검색어를 입력해주세요."
            />
            <button onClick={onClick}>검색</button>
          </form>
          <div>검색 키워드 : {keyWord}</div>
        </div>
        <ul>
          {data?.map(({ company, title, href, date }, idx) => (
            <li key={idx} className="item_list">
              <div className="item_company">{company}</div>
              <Link target="_blank" href={href}>
                <div>
                  {Parser(
                    title.replaceAll(
                      `${keyWord}`,
                      `<mark style='background-color: #b2ddfc; font-weight:bold'>${keyWord}</mark>`
                    )
                  )}
                </div>
              </Link>
              <div>{date}</div>
            </li>
          ))}
        </ul>
        <div className="loading-container">
          {loading && <img src="/loading.gif" />}
        </div>
      </div>
    </>
  );
}

async function getFetchData(keyword: string, page: string) {
  const { data } = await axios.get(
    `${process.env.NEXT_PUBLIC_HOST}/api/crawling?keyword=${keyword}&page=${page}`
  );
  return data;
}
