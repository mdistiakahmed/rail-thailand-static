// app/blogs/[slug]/page.tsx
import { notFound } from 'next/navigation'
import { PortableText } from '@portabletext/react'
import { client } from '@/sanity/lib/client'
import Image from 'next/image'
import { urlForImage } from '@/sanity/lib/image'
import { Metadata } from 'next'

export const dynamic = "force-static";
export const revalidate = false;

export async function generateStaticParams() {
  const query = `*[_type == "blog"] {
    "slug": slug.current
  }`
  const blogs = await client.fetch(query)
  return blogs.map((blog: any) => ({ slug: blog.slug }))
}

const fetchBlogData = async (slug: any) => {
  const query = `*[_type == "blog" && slug.current == $slug][0] {
    title,
    publishedAt,
    "category": category->title,
    "coverImage": coverImage {
    asset->{
      _id,
      url,
      metadata {
        dimensions {
          width,
          height
        }
      }
    },
    alt
  },
   excerpt,
    body,
    "author": author->name,
    "authorImage": author->image.asset->url
  }`

  const post = await client.fetch(query, { slug })

  return post;
}

/* ---------------------------
   Metadata
---------------------------- */
export async function generateMetadata({ params }: any): Promise<Metadata> {
  const { slug } = await params;
  const post = await fetchBlogData(slug);

  if (!post) {
    return {
      title: 'No blog found | RailThailand',
      description: 'The requested blog information could not be found.'
    };
  }

  const title = post.title;
  const description = post.excerpt;

  return {
    title,
    description,
    alternates: {
      canonical: `https://railthailand.com/blogs/${slug}`
    },
    openGraph: {
      title,
      description,
      type: 'website',
      images: [post.coverImage.asset.url],
      url: `https://railthailand.com/blogs/${slug}`
    }
  };
}

export default async function BlogPage({ params }: any) {
    const { slug } = await params;

  const post = await fetchBlogData(slug);

  if (!post) {
    notFound()
  }

  return (
    <article className="max-w-3xl mx-auto px-4 py-4">
      <div className="mb-8">
        <span className="inline-block px-3 py-1 text-sm font-medium text-blue-800 bg-blue-100 rounded-full mb-4">
          {post.category || 'General'}
        </span>
        <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
        {post.coverImage && (
        <div className="relative w-full h-64 md:h-96 mb-6 rounded-lg overflow-hidden">
            <Image
            src={post.coverImage.asset.url}
            alt={post.coverImage.alt || post.title}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, 80vw"
            />
        </div>
        )}
        {post.publishedAt && (
          <p className="text-gray-600">
            {new Date(post.publishedAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        )}
        {post.author && (
          <div className="flex items-center mt-4">
            {post.authorImage && (
              <img
                src={post.authorImage}
                alt={post.author}
                className="w-10 h-10 rounded-full mr-3"
              />
            )}
            <span className="text-gray-700">{post.author}</span>
          </div>
        )}
      </div>

      <div className="prose lg:prose-xl">
        <PortableText
          value={post.body}
          components={myPortableTextComponents}
        />
      </div>
    </article>
  )
}

// const CodeBlock = ({ value }: any) => {
//   const { language, code } = value;

//   const highlightedCode = hljs.highlight(code, {
//     language: language || "java",
//   }).value;

//   return (
//     <pre className="border md:mx-10 my-4 md:p-4 overflow-x-auto">
//       <code
//         className={`hljs language-${language || "java"}`}
//         dangerouslySetInnerHTML={{ __html: highlightedCode }}
//       />
//     </pre>
//   );
// };

function extractImageDimensions(ref: any) {
  const match = ref.match(/-(\d+)x(\d+)-/);
  if (!match) {
    throw new Error("Invalid image reference format");
  }
  const width = parseInt(match[1], 10);
  const height = parseInt(match[2], 10);
  return { width, height };
}

const MyPortableTextImage = ({ value }: any) => {
  const { asset, alt } = value;
  const dimensions = extractImageDimensions(asset._ref);

  return (
    <div className="w-full flex justify-center">
      <Image
        src={urlForImage(value)}
        alt={alt || "image"}
        width={dimensions.width}
        height={dimensions.height}
        className="text-center h-auto w-auto max-h-[600px]"
      />
    </div>
  );
};

const MyPortableTextVideo = ({ value }: any) => {
  const { url, title } = value;

  return (
    <div className="w-full flex justify-center my-8">
      <iframe
        width="560"
        height="315"
        src={url.replace("watch?v=", "embed/")}
        title={title || "Embedded Video"}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="rounded-lg"
      ></iframe>
    </div>
  );
};

const TableComponent = ({ value }: any) => {
  return (
    <div className="md:mx-10 my-4  overflow-x-auto">
      <table className="min-w-full border-collapse border border-gray-300">
        <tbody>
          {value.rows.map((row: any, rowIndex: number) => (
            <tr
              key={rowIndex}
              className={`border-b border-gray-300 ${
                rowIndex === 0 ? "bg-gray-200" : ""
              }`}
            >
              {row.cells.map((cell: any, cellIndex: number) => (
                <td
                  key={cellIndex}
                  className="px-4 py-2 border border-gray-300 text-left"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const myPortableTextComponents = {
  types: {
    image: MyPortableTextImage,
    videoEmbed: MyPortableTextVideo,
   // myCodeField: CodeBlock,
    table: TableComponent,
  },
  marks: {
    // myCodeField: ({ children }: any) => <CodeBlock>{children}</CodeBlock>,
    link: ({ value, children }: any) => (
      <a href={value.href} className="text-pink-600 underline">
        {children}
      </a>
    ),
  },
  block: {
    h1: ({ children }: any) => (
      <h1 className="text-3xl font-bold font-custom text-[#212529] my-4 tracking-wider">
        {children}
      </h1>
    ),
    h2: ({ children }: any) => (
      <h2 className="text-2xl font-bold text-[#212529] my-4 font-custom tracking-wider">
        {children}
      </h2>
    ),
    h3: ({ children }: any) => (
      <h3 className="text-xl font-bold text-[#212529] my-4 font-custom tracking-wider">
        {children}
      </h3>
    ),
    h4: ({ children }: any) => (
      <h4 className="text-lg text-[#212529] leading-[32px] my-4 font-custom tracking-wider">
        {children}
      </h4>
    ),
    normal: ({ children }: any) => {
      const isEmpty =
        !children || (children.length === 1 && children[0] === "");

      if (isEmpty) {
        return (
          <div className="h-4">
            {/* Empty div to create space for an empty line */}
          </div>
        );
      }

      return (
        <p className="my-4 font-custom text-xl font-[400] leading-[26px] text-[#212529] text-justify ">
          {children}
        </p>
      );
    },
    blockquote: ({ children }: any) => (
      <blockquote className="border-l-4 border-gray-400 pl-4 italic text-gray-700 my-4 font-custom leading-[28px]">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }: any) => (
      <ul className="list-disc pl-6 font-custom leading-[26px] text-[#212529] text-justify">
        {children}
      </ul>
    ),
    number: ({ children }: any) => (
      <ol className="list-decimal pl-6 font-custom leading-[26px] text-[#212529] text-justify">
        {children}
      </ol>
    ),
  },
};
