import xrplLogo from '../assets/logo.svg';

export default function renderXrplLogo() {
    document.getElementById('heading_logo').innerHTML = `
<a
    href="/"
    class="logo_link"
>
    <img id="xrpl_logo" class="logo vanilla" alt="CruX" src="${xrplLogo}" />
</a>
`;
}