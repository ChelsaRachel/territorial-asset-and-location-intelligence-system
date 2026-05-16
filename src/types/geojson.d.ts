declare module "*.geojson" {
  const value: {
    type: "FeatureCollection";
    features: unknown[];
    [key: string]: unknown;
  };

  export default value;
}
