import type { SimpleFeatureCollection } from "@/lib/types/territory";

export const zoningFeatureCollectionsByWilayah: Record<number, SimpleFeatureCollection> = {
  1206090: {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: {
          layer: "rtrw",
          peruntukan: "pertanian",
          label: "RTRW Pertanian Hortikultura",
          color: "#52B788",
        },
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [98.462, 3.165],
              [98.512, 3.162],
              [98.522, 3.205],
              [98.471, 3.216],
              [98.462, 3.165],
            ],
          ],
        },
      },
      {
        type: "Feature",
        properties: {
          layer: "rtrw",
          peruntukan: "permukiman",
          label: "RTRW Permukiman Berastagi",
          color: "#B45309",
        },
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [98.497, 3.18],
              [98.537, 3.179],
              [98.54, 3.21],
              [98.503, 3.219],
              [98.497, 3.18],
            ],
          ],
        },
      },
      {
        type: "Feature",
        properties: {
          layer: "rtrw",
          peruntukan: "hutan_produksi_terbatas",
          label: "RTRW Hutan Produksi Terbatas",
          color: "#1B4332",
        },
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [98.445, 3.205],
              [98.488, 3.216],
              [98.484, 3.248],
              [98.438, 3.239],
              [98.445, 3.205],
            ],
          ],
        },
      },
      {
        type: "Feature",
        properties: {
          layer: "actual_landcover",
          landcover: "kebun",
          label: "Aktual Kebun Campuran",
          color: "#74C69D",
        },
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [98.455, 3.171],
              [98.504, 3.171],
              [98.514, 3.224],
              [98.452, 3.229],
              [98.455, 3.171],
            ],
          ],
        },
      },
      {
        type: "Feature",
        properties: {
          layer: "actual_landcover",
          landcover: "hutan",
          label: "Aktual Hutan Lereng",
          color: "#2D6A4F",
        },
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [98.438, 3.222],
              [98.492, 3.23],
              [98.491, 3.256],
              [98.432, 3.248],
              [98.438, 3.222],
            ],
          ],
        },
      },
      {
        type: "Feature",
        properties: {
          layer: "kawasan_lindung",
          protection: "hutan_lindung_indikatif",
          label: "Referensi Kawasan Lindung Lereng",
          color: "#B42318",
        },
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [98.433, 3.233],
              [98.471, 3.243],
              [98.465, 3.262],
              [98.427, 3.253],
              [98.433, 3.233],
            ],
          ],
        },
      },
    ],
  },
  3204170: {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: {
          layer: "rtrw",
          peruntukan: "pertanian",
          label: "RTRW Pertanian dan Perkebunan",
          color: "#52B788",
        },
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [107.367, -7.104],
              [107.423, -7.112],
              [107.435, -7.061],
              [107.381, -7.051],
              [107.367, -7.104],
            ],
          ],
        },
      },
      {
        type: "Feature",
        properties: {
          layer: "rtrw",
          peruntukan: "permukiman",
          label: "RTRW Permukiman Ciwidey",
          color: "#B45309",
        },
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [107.401, -7.096],
              [107.438, -7.095],
              [107.438, -7.066],
              [107.405, -7.064],
              [107.401, -7.096],
            ],
          ],
        },
      },
      {
        type: "Feature",
        properties: {
          layer: "rtrw",
          peruntukan: "konservasi",
          label: "RTRW Konservasi Lereng",
          color: "#1B4332",
        },
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [107.346, -7.086],
              [107.384, -7.102],
              [107.382, -7.137],
              [107.335, -7.129],
              [107.346, -7.086],
            ],
          ],
        },
      },
      {
        type: "Feature",
        properties: {
          layer: "actual_landcover",
          landcover: "kebun",
          label: "Aktual Kebun dan Hortikultura",
          color: "#74C69D",
        },
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [107.359, -7.109],
              [107.418, -7.117],
              [107.431, -7.074],
              [107.367, -7.061],
              [107.359, -7.109],
            ],
          ],
        },
      },
      {
        type: "Feature",
        properties: {
          layer: "actual_landcover",
          landcover: "sawah",
          label: "Aktual Sawah",
          color: "#A7C957",
        },
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [107.413, -7.096],
              [107.449, -7.094],
              [107.449, -7.067],
              [107.418, -7.066],
              [107.413, -7.096],
            ],
          ],
        },
      },
      {
        type: "Feature",
        properties: {
          layer: "kawasan_lindung",
          protection: "konservasi_indikatif",
          label: "Buffer Konservasi Indikatif",
          color: "#B42318",
        },
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [107.336, -7.121],
              [107.371, -7.133],
              [107.364, -7.152],
              [107.326, -7.142],
              [107.336, -7.121],
            ],
          ],
        },
      },
    ],
  },
  5103060: {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: {
          layer: "rtrw",
          peruntukan: "pariwisata",
          label: "RDTR Pariwisata Intensif",
          color: "#52B788",
        },
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [115.154, -8.7],
              [115.181, -8.7],
              [115.183, -8.679],
              [115.156, -8.678],
              [115.154, -8.7],
            ],
          ],
        },
      },
      {
        type: "Feature",
        properties: {
          layer: "rtrw",
          peruntukan: "permukiman",
          label: "RDTR Permukiman Campuran",
          color: "#B45309",
        },
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [115.174, -8.699],
              [115.197, -8.696],
              [115.197, -8.676],
              [115.177, -8.678],
              [115.174, -8.699],
            ],
          ],
        },
      },
      {
        type: "Feature",
        properties: {
          layer: "rtrw",
          peruntukan: "sempadan",
          label: "Sempadan Pantai",
          color: "#1E40AF",
        },
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [115.148, -8.702],
              [115.157, -8.701],
              [115.159, -8.676],
              [115.149, -8.676],
              [115.148, -8.702],
            ],
          ],
        },
      },
      {
        type: "Feature",
        properties: {
          layer: "actual_landcover",
          landcover: "terbangun_padat",
          label: "Aktual Terbangun Padat",
          color: "#D97706",
        },
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [115.158, -8.701],
              [115.196, -8.698],
              [115.198, -8.676],
              [115.16, -8.676],
              [115.158, -8.701],
            ],
          ],
        },
      },
      {
        type: "Feature",
        properties: {
          layer: "kawasan_lindung",
          protection: "sempadan_pantai",
          label: "Buffer Sempadan Pantai",
          color: "#B42318",
        },
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [115.149, -8.702],
              [115.154, -8.702],
              [115.156, -8.676],
              [115.15, -8.676],
              [115.149, -8.702],
            ],
          ],
        },
      },
    ],
  },
};
