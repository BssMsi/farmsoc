# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/97737445-ecbc-415a-a570-764d80fd19ef

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/97737445-ecbc-415a-a570-764d80fd19ef) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with .

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Pending Implementations

### Farmer Post Creation
- [ ] Implement `getFarmerProducts` API endpoint to fetch farmer's products
  - Endpoint should return products sorted by creation date (newest first)
  - Include product details: id, name, createdAt, etc.
  - Handle error cases and loading states
- [ ] Add product selection validation in post creation
  - Ensure a product is selected before post submission
  - Show appropriate error messages
  - Update post creation API to include selected product ID

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/97737445-ecbc-415a-a570-764d80fd19ef) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes it is!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
