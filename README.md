# 🌊 FlowCraft

**FlowCraft** is a modern, powerful task management application designed to streamline your project workflows. Built with the latest web technologies, it offers a seamless experience for managing sprints, tracking issues, and collaborating with teams using intuitive Kanban boards.

## 🚀 Features

- **✨ Modern UI/UX:** Clean and responsive interface built with **Tailwind CSS** and **Shadcn UI**.
- **📊 Project Management:** Organize work with **Sprints** and **Kanban Boards**.
- **🐞 Issue Tracking:** Create, assign, and track issues with ease.
- **👥 Team Collaboration:** Built-in team management and member invitations.
- **🔐 Secure Authentication:** Robust user authentication powered by **Appwrite**.
- **📈 Dashboard:** Visual insights into your project's progress.

## 🛠️ Tech Stack

FlowCraft is built using a cutting-edge stack:

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/) & [Shadcn UI](https://ui.shadcn.com/)
- **Backend & Auth:** [Appwrite](https://appwrite.io/)
- **State Management:** React Context API
- **Forms:** React Hook Form + Zod
- **Icons:** Lucide React
- **Charts:** Recharts

## ☁️ Powered by Appwrite

This project relies heavily on **Appwrite** as its backend-as-a-service solution. Appwrite handles:

- **Authentication:** Secure user login, registration, and password management.
- **Database:** Storing projects, sprints, issues, and user data.
- **Teams:** Managing team memberships and permissions.

## 🏁 Getting Started

Follow these steps to run FlowCraft locally.

### Prerequisites

- **Node.js** (v18 or higher)
- **pnpm** (recommended) or npm/yarn
- An active **Appwrite** instance (local or cloud)

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/peniakoff/flow-craft-app.git
   cd flow-craft-app
   ```

2. **Install dependencies:**

   ```bash
   pnpm install
   ```

3. **Environment Setup:**
   Create a `.env.local` file in the root directory and add your Appwrite configuration:

   ```env
   NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1 # or your local endpoint
   NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_APPWRITE_DATABASE_ID=your_database_id
   ```

4. **Run the development server:**

   ```bash
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📂 Project Structure

- `app/`: Next.js App Router pages and layouts.
- `components/`: Reusable UI components and feature-specific widgets.
- `lib/`: Utility functions and Appwrite client configuration.
- `hooks/`: Custom React hooks.
- `types/`: TypeScript type definitions.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

_Built with ❤️ by [Tomasz Miller](https://github.com/peniakoff)_
