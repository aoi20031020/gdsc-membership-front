import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";

const AppHeader = styled.header`
  display: flex;
  background-color: #696969;
  flex-direction: row; // Change this line
  align-items: center;
  justify-content: left;
  font-size: calc(10px + 2vmin);
`;

const StyledButton = styled.button`
  color: white;
  background-color: #696969;
  padding: 20px;
  margin: 0 10px; // Add this line
  font-size: 20px;
`;
const HeaderStyle = styled.div`
  color: white;
  background-color: #696969;
  text-align: left;
  padding: 20px;
  padding-left: 0px;
  padding-right: 450px;
  font-size: 24px; //見出しのサイズ
  margin: 0px;
`;

const Picture = styled.picture`
  padding-left: 10px;
  width: 80px;
  heights: 50px;
`;

function Header() {
  return (
    <AppHeader>
      <Picture>
        <img src={`${process.env.PUBLIC_URL}/images/logo.png`}></img>
      </Picture>
      <HeaderStyle>GDSC　メンバー管理サイト</HeaderStyle>
      <Link to="/">
        <StyledButton>HOME</StyledButton>
      </Link>
      <Link to="/register">
        <StyledButton>Regester</StyledButton>
      </Link>
      <Link to="/members">
        <StyledButton>Members</StyledButton>
      </Link>
    </AppHeader>
  );
}

export default Header;
