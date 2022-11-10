# Kalipo-core

Decentralised blockchain platform for democratic consensus (proposals) and autonomous organisations (autons) 

<!-- PROJECT SHIELDS -->
<!--
*** I'm using markdown "reference style" links for readability.
*** Reference links are enclosed in brackets [ ] instead of parentheses ( ).
*** See the bottom of this document for the declaration of the reference variables
*** for contributors-url, forks-url, etc. This is an optional, concise syntax you may use.
*** https://www.markdownguide.org/basic-syntax/#reference-style-links
-->
[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]
[![LinkedIn][linkedin-shield]][linkedin-url]



<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/Kalipo-BV">
    <img src="images/Kalipo_Logo_512x512.png" alt="Logo" width="80" height="80">
  </a>

  <h3 align="center">Kalipo B.V.</h3>

  <p align="center">
    Take control, together
    <br />
    <br />
    <a href="#">View Demo (Todo)</a>
    ·
    <a href="#">Report Bug</a>
    ·
    <a href="#">Request Feature</a>
  </p>
</div>

<!-- ABOUT THE PROJECT -->
## About The Project

[![Product Name Screen Shot][product-screenshot]](#)

Kalipo’s central mission is to help communities create value for their own defined purpose.

We believe that DAOs are the key for vital communities and therefore key for vital societies and a vital earth.

Kalipo is built upon the elements of web3: 
* self-sovereign identities, 
* distributed ledgers 
* and tokens. 

Kalipo facilitates a new era of organizational transparency, member-management, digital independence and fair value distribution.

Are you inspired by our mission? Do you also believe that DAOs are the key for vital communities, vital societies and a vital earth? Contact and join us. 

Become a member of the Kalipo community. As a contributor, a developer, a marketeer, a visionary, a subject matter expert, an ambassador, an investor, an affiliate, a proposer, a user or just as somebody who is curious (be in the know).


<p align="right">(<a href="#readme-top">back to top</a>)</p>



### Built With

Both kalipo-core as kalipo-web3-ui utilizes
* [![JavaScript][JavaScript]][JavaScript]
* [![TypeScript][TypeScript]][TypeScript]

Kalipo-web3-ui specifically
* [![Vue][Vue.js]][Vue-url]
* [![Nuxt][Nuxt.js]][Nuxt-url]
* [![Vuetify][Vuetify]][Vuetify-url]


<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- GETTING STARTED -->
## Getting Started

This is an example of how you may give instructions on setting up your project locally.
To get a local copy up and running follow these simple example steps.

### Prerequisites

This is an example of how to list things you need to use the software and how to install them.
* npm
  ```sh
  npm install npm@latest -g
  ```

### Installation

_Below is an example of how you can instruct your audience on installing and setting up your app. This template doesn't rely on any external dependencies or services._

1. Clone the repo
   ```sh
   git clone https://github.com/Kalipo-BV/kalipo-core.git
   ```
2. Install NPM packages
   ```sh
   npm install
   ```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- USAGE EXAMPLES -->
## Usage

The following commands can be used to interact with the kalipo-core project

### Start a node
```
./bin/run start
```

### Add a new module
```
lisk generate:module ModuleName ModuleID
// Example
lisk generate:module token 1
```

### Add a new asset
```
lisk generate:asset ModuleName AssetName AssetID
// Example
lisk generate:asset token transfer 1
```

### Add a new plugin
```
lisk generate:plugin PluginAlias
// Example
lisk generate:plugin httpAPI
```

_For more examples, please refer to the [Lisk Documentation](https://lisk.com/documentation/)_

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- ROADMAP -->
## Roadmap

- [x] Minimum Viable Product
- [ ] Constitution management
- [ ] Constellation management
- [ ] Workflow management
- [ ] Treasury management
- [ ] 3th party integrations

See the [open issues](https://github.com/Kalipo-BV/kalipo-core/issues) for a full list of proposed features (and known issues).

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTRIBUTING -->
## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- LICENSE -->
## License

Distributed under the GNU GPL 3.0 License. See `LICENSE.md` for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- CONTACT -->
## Contact

Kalipo B.V. - office@kalipo.io

Project Link: [https://github.com/Kalipo-BV](https://github.com/Kalipo-BV)

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[contributors-shield]: https://img.shields.io/github/contributors/Kalipo-BV/kalipo-core.svg?style=for-the-badge
[contributors-url]: https://github.com/Kalipo-BV/kalipo-core/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/Kalipo-BV/kalipo-core.svg?style=for-the-badge
[forks-url]: https://github.com/Kalipo-BV/kalipo-core/network/members
[stars-shield]: https://img.shields.io/github/stars/Kalipo-BV/kalipo-core.svg?style=for-the-badge
[stars-url]: https://github.com/Kalipo-BV/kalipo-core/stargazers
[issues-shield]: https://img.shields.io/github/issues/Kalipo-BV/kalipo-core.svg?style=for-the-badge
[issues-url]: https://github.com/Kalipo-BV/kalipo-core/issues
[license-shield]: https://img.shields.io/github/license/Kalipo-BV/kalipo-core.svg?style=for-the-badge
[license-url]: https://github.com/Kalipo-BV/kalipo-core/blob/master/LICENSE.md
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: #
[product-screenshot]: images/ProposalScreenshot.png
[Next.js]: https://img.shields.io/badge/next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white
[Next-url]: https://nextjs.org/
[React.js]: https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[JavaScript]: https://shields.io/badge/JavaScript-3178C6?style=for-the-badge&logo=JavaScript&logoColor=4FC08D
[TypeScript]: https://shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=TypeScript&logoColor=4FC08D
[React-url]: https://reactjs.org/
[Vue.js]: https://img.shields.io/badge/Vue.js-35495E?style=for-the-badge&logo=vuedotjs&logoColor=4FC08D
[Nuxt.js]: https://img.shields.io/badge/Nuxt.js-35495E?style=for-the-badge&logo=nuxtdotjs&logoColor=4FC08D
[Vuetify]: https://img.shields.io/badge/Vuetify-35495E?style=for-the-badge&logo=vuetify&logoColor=4FC08D
[Vue-url]: https://vuejs.org/
[Nuxt-url]: https://nuxtjs.org/
[Vuetify-url]: https://vuetifyjs.com/
[Angular.io]: https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white
[Angular-url]: https://angular.io/
[Svelte.dev]: https://img.shields.io/badge/Svelte-4A4A55?style=for-the-badge&logo=svelte&logoColor=FF3E00
[Svelte-url]: https://svelte.dev/
[Laravel.com]: https://img.shields.io/badge/Laravel-FF2D20?style=for-the-badge&logo=laravel&logoColor=white
[Laravel-url]: https://laravel.com
[Bootstrap.com]: https://img.shields.io/badge/Bootstrap-563D7C?style=for-the-badge&logo=bootstrap&logoColor=white
[Bootstrap-url]: https://getbootstrap.com
[JQuery.com]: https://img.shields.io/badge/jQuery-0769AD?style=for-the-badge&logo=jquery&logoColor=white
[JQuery-url]: https://jquery.com 

