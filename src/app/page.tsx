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
      <div>
        <Link href="/ui/structured-data">Structured Data</Link>
      </div >
      <div>
        <Link href="/ui/structured-array">Structured Array</Link>
      </div >
      <div>
        <Link href="/ui/structured-enum">Structured Enum</Link>
      </div >
    </>
  );
}
