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
      <div>
        <Link href="/ui/multi-modal-chat">Multi Modal Chat</Link>
      </div >
      <div>
        <Link href="/ui/generate-image">Generate Image</Link>
      </div >
      <div>
        <Link href="/ui/transcribe-audio">Transcribe Audio</Link>
      </div >
      <div>
        <Link href="/ui/generate-speech">Generate Speech</Link>
      </div >
      <div>
        <Link href="/ui/tools">Tools</Link>
      </div>
      <div>
        <Link href="/ui/multiple-tools">Multiple Tools</Link>
      </div>
      <div>
        <Link href="/ui/api-tool">Api Tool</Link>
      </div>
      <div>
        <Link href="/ui/web-search-tool">Web Search Tool</Link>
      </div>
      <div>
        <Link href="/ui/generate-image-tool">Generate Image Tool</Link>
      </div>
      <div>
        <Link href="/ui/client-side-tools">Client Side Tools</Link>
      </div>
      <div>
        <Link href="/ui/mcp-tools">MCP Tools</Link>
      </div>
      <div>
        <Link href="/ui/reasoning">Reasoning(X)</Link>
      </div>
      <div>
        <Link href="/ui/message-metadata">Message Metadata</Link>
      </div>
    </>
  );
}
