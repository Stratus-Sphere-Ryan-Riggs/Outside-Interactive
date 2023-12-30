<style>
.sidebar-nav {
    position: sticky;
    top: 100px;
    /* z-index: 500; */
    width: 300px;
    max-width: 300px;
    align-self: start;
}
.sidebar-nav > span {
    display: block;
    margin-bottom: 12px;
}
.sidebar-nav li.active > a {
    color: var(--gray-interactive);
    font-weight: 500;
}
.sidebar-nav a {
    text-decoration: none;
    display: block;
    padding: 8px 0;
    color: var(--gray-lite-1);
    font-size: 12px;
    transition: all 100ms ease-in-out;
}
.sidebar-nav a:hover,
.sidebar-nav a:focus {
    color: var(--gray-text-1);
}
ul {
    list-style: none;
    margin: 0;
    padding: 0;
}
li {
    margin-left: 24px;
}
</style>

<nav class="sidebar-nav">
    <span class="reminder">Sections</span>
    <ul>
        <li><a href="#primary_information">Primary Information</a></li>
        <li><a href="#legal_address">Legal Address</a></li>
        <li><a href="#remittance_address">Remittance Address</a></li>
        <li><a href="#additional_information">Additional Information</a></li>
        <li><a href="#documents">Documents</a></li>
        <li><a href="#banking">Banking</a></li>
        <li><a href="#small_business">Small Business Categories</a></li>
    </ul>
</nav>
