export type PoolEvent = {
  slug: string;
  name: string;
  client: string;
  format: string;
  location: string;
  year: string;
  onHome: boolean;
  project: string;
};

export const FORMAT_LABEL: Record<string, string> = {
  launch: "Launch",
  festival: "Festival",
  government: "National",
  corporate: "Corporate",
  conference: "Conference",
  esports: "Esports",
  film: "Film",
  activation: "Activation",
};
