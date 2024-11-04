const TruncateText = ({
  content,
  length = 35,
}: {
  content: string;
  length?: number;
}) => {
  // const [isTruncated, setIsTruncated] = useState(true);

  // const toggleTruncate = () => {
  //   setIsTruncated((prev) => !prev);
  // };

  // If content length exceeds the specified length, truncate it
  const truncatedContent = true
    ? content.slice(0, length) + (content.length > length ? "..." : "")
    : content;

  return (
    <div>
      <p>{truncatedContent}</p>
    </div>
  );
};

export default TruncateText;
