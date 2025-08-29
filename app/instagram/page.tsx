'use client';

import { useMutation } from '@tanstack/react-query';
import Image from 'next/image';
import { Fragment, useState } from 'react';

type postParams = {
  link: string;
  rigName?: string;
  creator?: string;
  creatorHandle?: string;
  info?: string;
};

async function generatePost(props: postParams) {
  const res = await fetch('/api/instagram-post', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(props),
  });

  const data = await res.json();
  return data;
}

export default function InstaPostGenerator() {
  const [link, setLink] = useState('');
  const [rigName, setRigName] = useState('');
  const [creator, setCreator] = useState('');
  const [creatorHandle, setCreatorHandle] = useState('');
  const [info, setInfo] = useState('');

  const { mutate, data, isPending, error } = useMutation<{
    caption: string;
    images: string[];
    video: string | null;
    originalCaption: string;
  } | null>({
    mutationFn: () => generatePost({ link, rigName, creator, creatorHandle, info }),
  });

  return (
    <div className="space-y-4 p-4 pb-60 min-h-screen">
      <div className="fixed bottom-0 m-0 left-0 w-full flex gap-2 flex-col p-4 dark:bg-linear-65 bg-white dark:from-neutral-900 dark:to-stone-950 z-index-10">
        <input
          type="text"
          placeholder="Instagram link"
          value={link}
          onChange={e => setLink(e.target.value)}
          className="border border-indigo-900 rounded p-2 w-full"
        />
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Rig name"
            value={rigName}
            onChange={e => setRigName(e.target.value)}
            className="border border-indigo-900 rounded p-2 w-full"
          />
          <input
            type="text"
            placeholder="Creator"
            value={creator}
            onChange={e => setCreator(e.target.value)}
            className="border border-indigo-900 rounded p-2 w-full"
          />
          <input
            type="text"
            placeholder="Creator's Instagram handle"
            value={creatorHandle}
            onChange={e => setCreatorHandle(e.target.value)}
            className="border border-indigo-900 rounded p-2 w-full"
          />
        </div>
        <textarea
          placeholder="Extra info (rig details, style, etc.)"
          value={info}
          onChange={e => setInfo(e.target.value)}
          className="border border-indigo-900 rounded p-2 w-full"
          rows={2}
        />
        <button
          onClick={() => mutate()}
          disabled={isPending}
          className="uppercase w-full relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-purple-600 to-blue-500 group-hover:from-purple-600 group-hover:to-blue-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800">
          <span className="w-full relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-linear-65 dark:from-neutral-900 dark:to-stone-950 rounded-md group-hover:bg-transparent group-hover:dark:bg-transparent">
            {isPending ? (
              <>
                <svg
                  aria-hidden="true"
                  role="status"
                  className="inline w-4 h-4 me-3 text-white animate-spin"
                  viewBox="0 0 100 101"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                    fill="#E5E7EB"
                  />
                  <path
                    d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                    fill="currentColor"
                  />
                </svg>
                Generating...
              </>
            ) : (
              'Generate post'
            )}
          </span>
        </button>
      </div>

      <div className="mt-6 space-y-4">
        {error && <p className="text-red-500">{error.message}</p>}

        {data ? (
          <>
            {data.caption && (
              <>
                <h2 className="text-lg font-semibold">Caption</h2>
                <p className="whitespace-pre-wrap">{data.caption}</p>
              </>
            )}

            {!!data.images && !!data.images.length && (
              <>
                <h2 className="text-lg font-semibold">Images</h2>
                <div className="grid grid-cols-3 gap-4">
                  {data.images.map((src, i) => (
                    <Fragment key={i}>
                      <Image
                        src={`/api/image-proxy?url=${encodeURIComponent(src)}`}
                        alt={`IG media ${i}`}
                        layout="responsive"
                        width={500}
                        height={500}
                        className="rounded"
                      />
                    </Fragment>
                  ))}
                </div>
              </>
            )}

            {!!data.video && (
              <>
                <h2 className="text-lg font-semibold">Video</h2>
                <div className="grid grid-cols-2 gap-4">
                  <video controls className="rounded">
                    <source src={data.video} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
              </>
            )}
          </>
        ) : (
          <div>
            <h1 className="text-2xl font-semibold leading-normal bg-gradient-to-r from-blue-500 to-purple-600 inline-block text-transparent bg-clip-text">
              ReCast®{' '}
            </h1>
            <span className="text-sm bg-gradient-to-r from-neutral-400 to-neutral-500 ml-4 text-transparent bg-clip-text">
              Cast your rig. ReCast your content.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
