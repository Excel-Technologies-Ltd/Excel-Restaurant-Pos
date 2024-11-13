const TruncateText = ({
  content,
  length = 35,
}: {
  content: string;
  length?: number;
}) => {
  const hasHtml = (text) => /<\/?[a-z][\s\S]*>/i.test(text);
  const stripHtml = (html) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
  };
  // const [isTruncated, setIsTruncated] = useState(true);

  // const toggleTruncate = () => {
  //   setIsTruncated((prev) => !prev);
  // };
  const cleanContent = hasHtml(content) ? stripHtml(content) : content;

  // If content length exceeds the specified length, truncate it
  const truncatedContent = true
    ? cleanContent.slice(0, length) + (cleanContent.length > length ? "..." : "")
    : cleanContent;

  return (
    <div>
      <p>{truncatedContent}</p>
    </div>
  );
};

export default TruncateText;
