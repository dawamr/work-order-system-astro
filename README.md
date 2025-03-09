# Work Order Management System

## Overview

Work Order Management System adalah aplikasi web yang dirancang untuk mengelola dan melacak work order dalam lingkungan produksi. Aplikasi ini memungkinkan Production Manager untuk membuat, menjadwalkan, dan memantau work order, sementara Operator dapat melihat work order yang ditugaskan, memperbarui status, dan mencatat progres.

## Tech Stack

- **Frontend**:
  - [Astro](https://astro.build/): Framework web untuk membangun website yang cepat dengan performa optimal.
  - [React.js](https://reactjs.org/): Library JavaScript untuk membangun UI interaktif.
  - [Tailwind CSS](https://tailwindcss.com/): Framework CSS utility-first untuk styling yang cepat dan responsif.
  - [Lucide React](https://lucide.dev/): Library icon untuk antarmuka pengguna.
  - [Flowbite](https://flowbite.com/): Library komponen UI untuk React dan Tailwind CSS.
  - [Axios](https://axios-http.com/): Library untuk membuat HTTP request.
  - [Date-fns](https://date-fns.org/): Library untuk memformat tanggal.
- **Backend**:
  - Golang
- **Database**:
  - PostgreSQL

## Features

- **Autentikasi**: Login dan registrasi pengguna dengan role Production Manager dan Operator.
- **Manajemen Work Order**:
  - Membuat, membaca, memperbarui, dan menghapus work order (CRUD).
  - Menetapkan work order ke operator.
  - Memperbarui status work order (pending, in progress, completed, cancelled).
  - Menambah catatan progres pada work order.
  - Melihat riwayat status work order.
- **Laporan**:
  - Ringkasan work order berdasarkan status.
  - Laporan kinerja operator.
  - Filter laporan berdasarkan rentang tanggal.
- **UI Responsif**: Tampilan yang optimal di berbagai perangkat.
- **Dark Mode**: Pilihan tema terang dan gelap.

## Folder Structure

```shell
work-order-system-astro/
├── src/
│ ├── components/ # Reusable UI components
│ │ ├── work-order-views/ # Work order specific components
│ │ ├── reports/ # Report specific components
│ ├── layouts/ # Global layouts
│ ├── pages/ # Pages & routing
│ ├── utils/ # Helper functions
│ │ ├── api.ts # API interaction
│ │ ├── localStorage.ts # Local storage operations
│ ├── types/ # TypeScript type definitions
│ │ ├── workOrders.ts # Work order types
│ ├── styles/ # Global styles
│ │ ├── global.css # Global CSS file
│ ├── env.d.ts # Environment variables type definition
├── public/ # Static files
├── astro.config.mjs # Astro configuration file
├── tailwind.config.js # Tailwind CSS configuration file
├── postcss.config.js # PostCSS configuration file
├── package.json # Dependencies and scripts
├── README.md # Project documentation
```

## Installation

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 atau lebih baru)
- [npm](https://www.npmjs.com/) atau [yarn](https://yarnpkg.com/)
- Backend API yang sudah berjalan (pastikan `API_URL` diatur dengan benar)

### Setup Instructions

1.  Clone the repository

    ```bash
    git clone https://github.com/username/work-order-management-system.git
    cd work-order-management-system
    ```

2.  Install dependencies

    ```bash
    npm install
    # atau
    yarn install
    ```

3.  Konfigurasi environment variables

    - Buat file `.env` di root project (jika belum ada).
    - Tambahkan variabel `API_URL` dengan URL backend API Anda.

      ```
      API_URL=http://localhost:8080
      ```

      > **Catatan:** Anda dapat melihat konfigurasi `API_URL` pada `astro.config.mjs`

4.  Jalankan development server

    ```bash
    npm run dev
    # atau
    yarn dev
    ```

5.  Buka browser dan akses `http://localhost:4321`

## Usage

- Buka halaman login untuk mengakses aplikasi. (http://localhost:4321 / https://workoder.dawam.dev)
- Gunakan kredensial demo berikut:
  - **Production Manager**: `manager` / `password`
  - **Operator**: `operator1` / `password`
- Production Manager dapat mengakses dashboard untuk mengelola work order dan laporan.
- Operator dapat mengakses halaman assigned orders untuk melihat dan memperbarui work order yang ditugaskan.

## Contributing

Jika Anda ingin berkontribusi pada project ini, silakan fork repository dan buat pull request.

## License

[MIT](https://choosealicense.com/licenses/mit/)

## Contact

Dawam Raja - [dawam.dev](https://dawam.dev)

Project Link: [https://github.com/dawamr/work-order-system-astro](https://github.com/dawamr/work-order-system-astro)
