type Props = {
  message: string;
};

export function Toast({ message }: Props) {
  return (
    <div className="toast" role="status">
      <span className="status-dot-online shrink-0" />
      {message}
    </div>
  );
}
