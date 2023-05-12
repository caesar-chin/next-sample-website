import { type GetStaticProps, type NextPage } from "next";
import Head from "next/head";

import PageLayout from "../components/layout";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { api } from "~/utils/api";

import { generateSSGHelper } from "~/server/helpers/ssgHelper";
import PostView from "../components/postview";

dayjs.extend(relativeTime);

const SinglePostPage: NextPage<{ id: string }> = ({ id }) => {
  const { data } = api.posts.getById.useQuery({
    id,
  });

  if (!data) return <div>404</div>;

  return (
    <>
      <Head>
        <title>{`${data.post.content} - ${data.author.username}`}</title>
      </Head>
      <PageLayout>
        <PostView {...data} />
      </PageLayout>
    </>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  const ssg = generateSSGHelper();

  // gets the slug from the url
  const id = context.params?.id;

  if (typeof id !== "string") throw new Error("no slug");

  await ssg.posts.getById.prefetch({ id });

  return {
    props: { trpcState: ssg.dehydrate(), id },
  };
};

export const getStaticPaths = () => {
  return { paths: [], fallback: "blocking" };
};

export default SinglePostPage;
