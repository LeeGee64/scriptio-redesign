import type { NextPage } from "next";
import Head from "next/head";
import EditorContainer from "../components/EditorContainer";
import HomePageNavbar from "../components/HomePageNavbar";

const EditorPage: NextPage = () => {
  return (
    <div>
      <Head>
        <title>Scriptio - Editor</title>
      </Head>
      <div className="main-container">
        <HomePageNavbar className="navbar" />
        <EditorContainer />
      </div>
    </div>
  );
};

export default EditorPage;