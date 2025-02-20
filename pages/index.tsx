import Head from 'next/head'
import Link from 'next/link'
import Header from '../components/Header'
import { sanityClient, urlFor } from '../sanity'
import { Post } from '../typing'

interface Props {
  posts: Post[]
}

export default function Home({ posts }: Props) {
  return (
    <div className='max-w-7xl mx-auto pb-10'>
      <Head>
        <title>Medium Blog App</title>
        <link rel="icon" href="/logo.png" />
      </Head>

      <Header />

      <div className='flex items-center justify-between bg-yellow-400 border-b border-black py-10 lg:py-0'>
        <div className='px-10 space-y-5'>
          <h1 className='text-6xl max-w-xl font-serif'><span className='underline decoration-black decoration-4'>Medium</span> is a place to write, read and connect</h1>
          <h2>It's easy and free to post your thinking on any topic and connect with millions of readers.</h2>
        </div>

        <img className='hidden md:inline-flex h-32 lg:h-full' src="/medium.png" alt="" />
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap3 md:gap-6 p-2 md:p-6 py-10 md:py-20'>
        {posts.map(post => <Link key={post._id} href={`/post/${post.slug.current}`}>
          <div className='group cursor-pointer border rounded-lg overflow-hidden'>
            <img className='h-60 w-full object-cover group-hover:scale-105 transition-transform duration-200 ease-in-out' src={urlFor(post.mainImage).url()!} alt="" />
            <div className='flex items-center justify-between p-5 bg-white'>
              <div>
                <p className='text-lg font-bold text-gray-900'>{post.title}</p>
                <p className='text-sm text-gray-700'>{post.description} by {post.author.name}</p>
              </div>
              <img className='h-12 w-12 rounded-full' src={urlFor(post.author.image).url()!} alt="" />
            </div>
          </div>
        </Link>)}
      </div>

    </div>
  )
}

export const getServerSideProps = async () => {
  const query = `*[_type == 'post']{
    _id,
    title,
    author-> {
      name,
      image
    },
    description,
    mainImage,
    slug
  }`

  const posts = await sanityClient.fetch(query);
  return {
    props: {
      posts
    }
  }
}
