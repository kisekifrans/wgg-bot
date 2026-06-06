type Props = {
  image?: string;
  thumbnail?: string;
  onImageChange: (value: string) => void;
  onThumbnailChange: (value: string) => void;
};

export function EmbedMediaFields({ image, thumbnail, onImageChange, onThumbnailChange }: Props) {
  return (
    <div className="mt-3 grid gap-3 sm:grid-cols-2">
      <div>
        <label className="label">Image URL</label>
        <input
          className="input"
          type="url"
          placeholder="https://… (large image at bottom)"
          value={image || ''}
          onChange={(e) => onImageChange(e.target.value)}
        />
        <p className="hint mt-1">Must be a public https link (PNG, JPG, GIF).</p>
      </div>
      <div>
        <label className="label">Thumbnail URL</label>
        <input
          className="input"
          type="url"
          placeholder="https://… (small top-right image)"
          value={thumbnail || ''}
          onChange={(e) => onThumbnailChange(e.target.value)}
        />
      </div>
    </div>
  );
}
