import { GetStaticProps } from "next";
import Header from "../../components/Header";
import { sanityClient, urlFor } from "../../sanity";
import { Post as PostInterface } from "../../typing";
import PortableText from 'react-portable-text'
import { useForm, SubmitHandler } from 'react-hook-form'
import { useState } from "react";

interface Props {
    post: PostInterface
}

interface FormInput {
    _id: string,
    name: string,
    email: string,
    comment: string
}

const Post = ({ post }: Props) => {
    const [submitted, setSubmitted] = useState(false);
    const [isSending, setIsSending] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm<FormInput>();

    const submitForm: SubmitHandler<FormInput> = async (data) => {
        setIsSending(true);
        fetch('/api/comment', {
            method: 'POST',
            body: JSON.stringify(data)
        }).then((res) => setSubmitted(true)).catch((e) => console.log(e))
        setIsSending(false);
    }

    return <main>
        <Header />
        <img className="h-96 object-contain w-full" src={urlFor(post.mainImage).url()!} alt="" />
        <article className="max-w-3xl mx-auto p-5">
            <h1 className="text-3xl mt-10 mb-3">{post.title}</h1>
            <p className="tet-xl font-light text-gray-600 mb-2">{post.description}</p>

            <div className="flex items-center space-x-2">
                <img className="h-10 w-10 rounded-full" src={urlFor(post.author.image).url()!} alt="" />
                <p className="text-sm font-extralight">Blog post by <span className="text-green-600">{post.author.name}</span> - Published at {new Date(post._createdAt).toDateString()}, {new Date(post._createdAt).toLocaleTimeString()}</p>
            </div>

            <div className="mt-10">
                <PortableText
                    dataset={process.env.NEXT_PUBLIC_SANITY_DATASET!}
                    projectId={process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!}
                    content={post.body}
                    serializers={{
                        h1: (props: any) => <h1 className="text-2xl font-bold my-5" {...props} />,
                        h2: (props: any) => <h1 className="text-xl font-bold my-5" {...props} />,
                        li: ({ children }: any) => <li className="ml-4 list-disc"> {children} </li>,
                        link: ({ href, children }: any) => <a href={href} className="text-blue-500 hover:underline"> {children} </a>,
                    }
                    }
                />
            </div>
        </article>

        <hr className="max-w-lg my-5 mx-auto border border-yellow-500" />

        {submitted
            ?
            <div className="fle flex-col py-10 my-10 bg-yellow-500 text-white max-w-2xl mx-auto text-center">
                <h1 className="text-3xl font-semibold">Thank you for submitting your comment!</h1>
                <p className="text-lg">Once it has been approved, it will appear below</p>
            </div>
            : <form onSubmit={handleSubmit(submitForm)} className="flex flex-col p-5 mb-10 max-w-2xl mx-auto">
                <h3 className="text-sm text-yellow-50">Enjoyed this article?</h3>
                <h4 className="text-3xl font-bold">Leave a comment below!</h4>
                <hr className="py-3 mt-2" />

                <input {...register('_id')} type="hidden" name="_id" value={post._id} />
                <label className="block mb-5">
                    <span className="text-gray-700 font-medium">Name</span>
                    <input {...register('name', { required: true })} type="text" className="shadow border rounded py-2 px-3 my-1 block w-full form-input ring-yellow-500 outline-none focus:ring" placeholder="John doe" />
                    {errors.name && <span className="text-red-500">The Name Field is required</span>}
                </label>
                <label className="block mb-5">
                    <span className="text-gray-700 font-medium">Email</span>
                    <input {...register('email', { required: true })} type="email" className="shadow border rounded py-2 px-3 mt-1 block w-full form-input ring-yellow-500 outline-none focus:ring" placeholder="John@host.in" />
                    {errors.email && <span className="text-red-500">The Email Field is required</span>}
                </label>
                <label className="block mb-5">
                    <span className="text-gray-700 font-medium">Comment</span>
                    <textarea {...register('comment', { required: true })} className="shadow border rounded py-2 px-3 mt-1 form-textarea block w-full ring-yellow-500 outline-none focus:ring" placeholder="Type your comment here" rows={8} />
                    {errors.comment && <span className="text-red-500">The Comment Field is required</span>}
                </label>

                <input type="submit" className="shadow bg-yellow-500 hover:bg-yellow-400 focus:shadow-outline focus:outline-none text-white font-bold py-2 text-xl rounded max-w-xs cursor-pointer shadow-yellow-200" disabled={isSending} value={isSending ? 'Submit' : 'Wait...'} />
            </form>}

        <div className="flex flex-col p-10 my-10 max-w-2xl mx-auto shadow shadow-yellow-500 space-y-2">
            <h3 className="text-4xl font-semibold">Comments</h3>
            <hr className="pb-2" />

            {post.comments.length > 0 ? post.comments.map((comment) =>
                <div key={comment._id}>
                    <p className="text-gray-700 break-all"><span className="text-yellow-500 text-lg font-medium">{comment.name} :</span> {comment.comment}</p>
                </div>
            )
                :
                <h1 className="text-lg font-medium">Be the first to comment</h1>}
        </div>
    </main>;
};

export default Post;

export const getStaticPaths = async () => {
    const query = `*[_type == 'post']{
        _id,
        slug{
            current
        }
    }`
    const posts = await sanityClient.fetch(query);
    const paths = posts.map((post: PostInterface) => ({
        params: {
            slug: post.slug.current
        }
    }))
    return {
        paths, fallback: 'blocking'
    }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
    const query = `*[_type == 'post' && slug.current == $slug][0]{
        _id,
        _createdAt,
        title,
        author-> {
          name,
          image
        },
        'comments': *[
            _type == 'comment'
            && post._ref == ^._id 
            // && approved==true
        ],
        description,
        mainImage,
        slug,
        body
      }`
    const post = await sanityClient.fetch(query, {
        slug: params?.slug
    })
    if (!post) {
        return {
            notFound: true
        }
    }
    return {
        props: {
            post
        },
        revalidate: 60
    }
}
