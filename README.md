# TDT4242_group03
### setup instructions:
in the root folder (/files/) create a file named .env and copy the following content in it:

	# Database Configuration
	DB_HOST=localhost
	DB_USER=root
	DB_PASSWORD=your_mysql_password_here
	DB_NAME=ai_guidebook_db
	DB_PORT=3306

	# Server Configuration
	PORT=5000

	# Client URL (for CORS)
	CLIENT_URL=http://localhost:5173

in the same folder, create a file named .gitignore and copy:

	# Dependencies
	node_modules/
	client/node_modules/

	# Environment variables
	.env
	.env.local
	.env.development
	.env.production

	# Build outputs
	client/dist/
	client/build/

	# Uploaded files
	server/uploads/*
	!server/uploads/.gitkeep

	# Logs
	npm-debug.log*
	yarn-debug.log*
	yarn-error.log*

	# Editor directories
	.vscode/
	.idea/
	*.swp
	*.swo
	*~

	# OS files
	.DS_Store
	Thumbs.db

	# Temporary files
	*.tmp
	*.temp

install Node.js and npm
go into the /files/ folder and run `npm install`
go into the /client/ folder and run `npm install`

install MySQL and run the server (remember to change the password to your password in the .env file)

run the application: `npm run dev`.
