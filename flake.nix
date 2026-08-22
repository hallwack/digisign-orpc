{
  description = "Bun Environment for Digisign Development";

  inputs = {
    # nixpkgs.url = "github:nixos/nixpkgs?ref=nixos-unstable";
    # flake-utils.url = "github:numtide/flake-utils";
  };

  outputs =
    {
      nixpkgs,
      ...
    }:
    let
      eachSystem =
        f:
        nixpkgs.lib.genAttrs nixpkgs.lib.systems.flakeExposed (
          system: f system nixpkgs.legacyPackages.${system}
        );
    in
    {
      devShells = eachSystem (
        _system: pkgs: {
          default = pkgs.mkShell {
            packages = [
              pkgs.bun
              pkgs.typescript
            ];
          };
        }
      );
    };
}
