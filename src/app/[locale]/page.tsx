import Calendrian from "@/components/wrappers/calendrian"
// Add declaration for Umami
declare global {
  interface Window {
    umami: {
      track: (eventName: string, eventData?: Record<string, any>) => void
    }
  }
}

export default function Home() {

  return (
    <>
      <Calendrian />
    </>
  )
}
