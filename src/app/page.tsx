import Image from "next/image";
import Link from 'next/link'

export default function Home() {
  return (
    <>
      <div>
        <Link href="/ui/completion">Completion</Link>
      </div>
      <div>
        <Link href="/ui/stream">Stream</Link>
      </div >
      <div>
        <Link href="/ui/chat">Chat</Link>
      </div >
    </>
  );
}
