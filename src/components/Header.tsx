import React, { memo } from "react";
import { DarkIcon, GithubIcon, LightIcon } from "./Icons";
import logo from "./logo.png";

interface Props {
  handleThemeMode: () => void;
  theme: string;
}

function Header({ handleThemeMode, theme }: Props) {
  return (
    <header
      className={`navbar navbar-expand-md fixed-top shadow-sm ${
        theme === "dark" ? "bg-dark navbar-dark" : "bg-light navbar-light"
      }`}
    >
      <nav className='container flex-wrap flex-md-nowrap'>
        <a className='navbar-brand' href='/' aria-label='home'>
          <img src={logo} alt='logo' className='keyboard-logo' />
          <span className='fw-bold' id='web'>
            Web
          </span>
          <span className='typist'>Typist.</span>
        </a>
        <ul className='navbar-nav flex-row flex-wrap ms-md-auto'>
          <li className='nav-item col-md-auto me-3'>
            <a
              className='nav-link p-2'
              href='https://github.com/swmdxn15?tab=repositories'
              target='_blank'
              rel='noopener noreferrer'
              aria-label='github'
            >
              <GithubIcon fill={theme === "dark" ? "#eee" : "#333"} />
            </a>
          </li>
          <li className='nav-item col-md-auto'>
            <span
              className='nav-link p-2'
              aria-hidden='true'
              style={{ cursor: "pointer" }}
              onClick={handleThemeMode}
            >
              {theme === "dark" ? <LightIcon /> : <DarkIcon />}
            </span>
          </li>
        </ul>
      </nav>
    </header>
  );
}

export default memo(Header);
