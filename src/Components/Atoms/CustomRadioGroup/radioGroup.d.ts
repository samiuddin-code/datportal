export type AppProps = {
  children?: string;
  type: "largeTrack" | "smallTrack";
  items: Array<{ label: string; value: string }>;
  defaultValue?: number | string;
  onChange?: (e) => void;
  name:string;
};