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
  const [data, setData] = useState<IData[]>();
  const [loading, setLoading] = useState(false);

  const onClick = async () => {
    setKeyWord(value);
    setLoading(true);
    const { data } = await axios.get(
      `${process.env.NEXT_PUBLIC_HOST}/api/crawling?keyword=${value}`
    );
    setLoading(false);
    setData(data);
    setValue("");
  };

  return (
    <>
      <Head>
        <title>뉴스 크롤링 사이트</title>
        <meta
          name="description"
          content="600개의 기업 뉴스 정보를 제공합니다."
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
            />
            <button onClick={onClick}>검색</button>
          </form>
          <div>검색 키워드 : {keyWord}</div>
        </div>
        <div>
          <ul>
            {loading ? (
              <div>로딩 중..</div>
            ) : (
              data?.map(({ company, title, href, date }, idx) => (
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
              ))
            )}
          </ul>
        </div>
      </div>
    </>
  );
}
