# Cincinnati Hotel Chatbot System

## Overview

This web application simulates a real-life hotel information chatbot system for "Cincinnati Hotel."

The goal is to build a fully functional platform where hotel guests can chat with an AI assistant that answers their questions about the hotel's facilities, rooms, prices, and general services — based strictly on information available in an uploaded PDF document.

## User Roles

The system has two user roles:

1. **Admin** – can upload/update the hotel information PDF and view usage statistics.
2. **User** – can chat with the hotel's AI assistant and ask any questions about the hotel.

If the chatbot cannot find an answer in the uploaded document, it should politely respond that it doesn't know and offer the user to leave contact details so a customer service representative can get back to them later.

## Objective

Develop a production-ready web system that allows two types of interactions:

- **Admin**: Upload a single hotel information PDF (replacing the previous version) and view real-time statistics on chatbot activity.
- **User**: Chat in real time with a hotel chatbot that answers questions using only the uploaded PDF as its knowledge base.

## Requirements

### User Side

- On the first page of the website, there should be two simple buttons: "Admin" and "Regular User." The user can click one of them to enter the relevant mode. There is no need to implement a real user management or authentication system. The purpose is only to demonstrate both experiences (admin and user) in a simple way.
- Users can then chat with the "Cincinnati Hotel" chatbot.
- The chatbot must base all its answers only on the content of the uploaded PDF file.
- If the chatbot cannot find an answer, it should:
  - Respond with a polite message such as: "I'm sorry, I don't have that information right now."
  - Offer the user to fill out a short contact form (Name, Phone, Email).
  - If a user is filling out that form, an email should be sent to idan@tauga.ai with a summary of the conversation so far and what was the question that the AI Chatbot didn't manage to answer.

### Admin Side

- The Admin view can be accessed simply by clicking "Admin" on the opening page — no authentication is required. There is no need to verify that the admin is a real administrator. The goal is only to demonstrate the functionality.
- Admins can:
  - Upload a single PDF file that serves as the chatbot's knowledge base. Uploading a new file replaces the previous one.
  - View a statistics dashboard including:
    - Total number of chat sessions.
    - Number of questions asked per topic/category. (Example: "Rooms" – 12 questions, "Restaurant" – 8 questions, etc.)
  - Statistics should update in real time or immediately after each chat session.

## Implementation Details

- **Frontend (UI)**: Must be built with React.
  - The interface should be modern, clean, and user-friendly.
- **Backend**: Should be implemented with Node.js.
- **Automation Workflow**: The AI analysis and chatbot logic should be orchestrated via n8n.
- If you wish to use any additional tools or frameworks – it's possible.
- The candidate may use their own OpenAI API key or request a preloaded one from us.

## Deliverables

- A fully functional production system accessible via a public URL.
- The n8n workflow JSON file should be included in this repository.
- Clear documentation (PDF format) including:
  - Description of the architecture and chosen technologies.
  - Explanation of how the chatbot processes the PDF information.
  - Overview of the admin dashboard design and data flow.
  - Instructions for running, testing, and extending the system.

## Evaluation Criteria

- **Functionality**: Does the system meet all defined requirements?
- **Accuracy**: Does the chatbot rely only on the uploaded PDF for its answers?
- **Real-time Updates**: Are chat statistics updated correctly and immediately after chat sessions?
- **Creativity**: How effectively were AI tools or automation platforms used?
- **UI/UX**: Is the interface modern, clear, and pleasant to use? Proper one for a hotel.
- **Documentation**: Is the technical explanation clear and reproducible?

---

## Development Guidelines

A couple of small tips for the task:

- Please follow the instructions closely. I'm not expecting you to do extra things beyond the spec, but I do expect you to be meticulous about everything that is requested and make sure all the required functionality is implemented and working.
- Please do high-quality QA on your own work. Imagine that when you send the task back to me, you're actually sending it to the project's client (the hotel manager), and they need to be truly satisfied with the product.
