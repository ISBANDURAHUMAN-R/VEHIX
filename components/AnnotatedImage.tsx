// src/components/AnnotatedImage.tsx
import React from 'react';

interface Props {
  imageUrl: string; // Relative URL returned by the backend, e.g., /results/<filename>.jpg
}

const AnnotatedImage: React.FC<Props> = ({ imageUrl }) => {
  if (!imageUrl) {
    return null;
  }

  const fullUrl = `${window.location.origin}${imageUrl}`;

  return (
    <div className="mt-8 text-center">
      <h3 className="text-xl font-semibold mb-4">Annotated Image</h3>
      <img src={imageUrl} alt="Annotated result" className="mx-auto max-w-full rounded shadow" />
      <div className="mt-4">
        <a
          href={imageUrl}
          download="annotated_image.jpg"
          className="inline-block bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded"
        >
          Download Result
        </a>
      </div>
    </div>
  );
};

export default AnnotatedImage;
