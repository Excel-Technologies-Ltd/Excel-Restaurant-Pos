import { useState } from "react";

const TextShowHide = ({
  content,
  length = 25,
}: {
  content: string;
  length?: number;
}) => {
  const [showFullArticle, setShowFullArticle] = useState(false);

  const characters = content?.split("");
  const truncatedContent = characters?.slice(0, length)?.join("");
  const isTruncated = characters.length > length;

  return (
    <div>
      {showFullArticle ? content : truncatedContent}
      {isTruncated && (
        <span
          className="cursor-pointer"
          onClick={() => setShowFullArticle((prev) => !prev)}
        >
          ...
        </span>
      )}
    </div>
  );
};

export default TextShowHide;
