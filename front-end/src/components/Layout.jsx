import React from "react";
import "./Layout.css";

export default function Layout() {
  return (
    <div className="container">
      <header>
        <nav className="navbar">
          <ul>
            <li><a href="#">Home</a></li>
            <li><a href="#">About</a></li>
            <li><a href="#">Services</a></li>
            <li><a href="#">Contact</a></li>
          </ul>
        </nav>
      </header>
      <aside className="left-sidebar">Left Sidebar</aside>
      <main>Main Content</main>
      <aside className="right-sidebar">Right Sidebar</aside>
      <footer>Footer</footer>
    </div>
  );
}