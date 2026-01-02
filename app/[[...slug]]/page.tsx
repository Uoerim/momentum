import MainPage from "../page";

export default function CatchAllPage() {
  return <MainPage />;
}

export function generateStaticParams() {
  return [
    { slug: ["projects"] },
    { slug: ["blog"] },
    { slug: ["contact"] },
  ];
}
