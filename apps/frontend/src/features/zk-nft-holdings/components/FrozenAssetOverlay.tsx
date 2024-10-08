interface FrozenAssetOverlayProps {
  freezeDelegate: string;
}

export const FrozenAssetOverlay = ({
  freezeDelegate,
}: FrozenAssetOverlayProps) => {
  return (
    <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center rounded-lg p-2">
      <div className="text-white text-center font-semibold">
        Frozen by
        <a
          className="block underline"
          href={`https://solscan.io/account/${freezeDelegate}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {freezeDelegate.slice(0, 8)}..{freezeDelegate.slice(-8)}
        </a>
      </div>
    </div>
  );
};
