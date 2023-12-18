import { GraphQLError } from "graphql";
import * as reviews from "../data/reviews.js";
import * as users from "../data/users.js";
import * as apartments from "../data/apartments.js";

import redis from "redis";
import flat from "flat";
import validation from "../utils/helpers.js";
import { v4 as uuid } from "uuid";

const unflatten = flat.unflatten;
const client = redis.createClient();
client.connect().then(() => {});
export const resolvers = {
  Query: {
    // Fetch all renters
    renters: async () => {
      let exists = await client.exists("renters");
      if (exists) {
        console.log("renters in cache");
        try {
          let allRenters = await client.get("renters");
          return JSON.parse(allRenters);
        } catch (e) {
          throw new GraphQLError(`Internal Server Error`, {
            extensions: { code: "INTERNAL_SERVER_ERROR" },
          });
        }
      } else {
        try {
          const renters = await users.getAllRenters();
          if (!renters) {
            throw new GraphQLError(`Internal Server Error`, {
              extensions: { code: "INTERNAL_SERVER_ERROR" },
            });
          }
          await client.set("renters", JSON.stringify(renters));
          await client.expire("renters", 3600);
          return renters;
        } catch (e) {
          throw new GraphQLError(`Internal Server Error`, {
            extensions: { code: "INTERNAL_SERVER_ERROR" },
          });
        }
      }
    },
    // Fetch all landlords
    landlords: async () => {
      let exists = await client.exists("landlords");
      if (exists) {
        console.log("landlords in cache");
        try {
          let allLandlords = await client.get("landlords");
          return JSON.parse(allLandlords);
        } catch (e) {
          throw new GraphQLError(`Internal Server Error`, {
            extensions: { code: "INTERNAL_SERVER_ERROR" },
          });
        }
      } else {
        try {
          const landlords = await users.getAllLandlords();
          if (!landlords) {
            throw new GraphQLError(`Internal Server Error`, {
              extensions: { code: "INTERNAL_SERVER_ERROR" },
            });
          }
          await client.set("landlords", JSON.stringify(landlords));
          await client.expire("renters", 3600);
          return landlords;
        } catch (e) {
          throw new GraphQLError(`Internal Server Error`, {
            extensions: { code: "INTERNAL_SERVER_ERROR" },
          });
        }
      }
    },
    // Fetch a single renter by ID
    getRenterById: async (_, args) => {
      let id = args.uid.trim();
      let exists = await client.exists(`renter.${id}`);
      if (exists) {
        console.log("renter in cache");
        try {
          let detailRenter = await client.get(`renter.${id}`);
          return JSON.parse(detailRenter);
        } catch (e) {
          throw new GraphQLError(e, {
            extensions: { code: "INTERNAL_SERVER_ERROR" },
          });
        }
      } else {
        console.log("renter not in cache");
        try {
          const renter = await users.getUserById(id);
          if (!renter) {
            throw new GraphQLError("Renter Not Found", {
              extensions: { code: "NOT_FOUND" },
            });
          }
          const renterFields = {
            uid: renter.uid,
            name: renter.name, 
            dateOfBirth: renter.dateOfBirth,
            gender: renter.gender,
            savedApartments: renter.bookmarkedApartments
          }
          await client.set(`renter.${id}`, JSON.stringify(renterFields));
          return renterFields;
        } catch (e) {
          throw new GraphQLError(e, {
            extensions: { code: "INTERNAL_SERVER_ERROR" },
          });
        }
      }
    },
    // Fetch a single landlord by ID
    getLandlordById: async (_, args) => {
      let id = args.uid.trim();
      let exists = await client.exists(`landlord.${id}`);
      if (exists) {
        console.log("landlord in cache");
        try {
          let detailLandlord = await client.get(`landlord.${id}`);
          return JSON.parse(detailLandlord);
        } catch (e) {
          throw new GraphQLError(e, {
            extensions: { code: "INTERNAL_SERVER_ERROR" },
          });
        }
      } else {
        console.log("landlord not in cache");
        try {
          const landlord = await users.getUserById(id);
          if (!landlord) {
            throw new GraphQLError("Land lord Not Found", {
              extensions: { code: "NOT_FOUND" },
            });
          }
          const landlordFields = {
            uid: landlord.uid,
            name: landlord.name,
            contactInfo: landlord.email,
            ownedApartments: landlord.bookmarkedApartments
          };
          await client.set(`landlord.${id}`, JSON.stringify(landlordFields));
          return landlordFields;
        } catch (e) {
          throw new GraphQLError(e, {
            extensions: { code: "INTERNAL_SERVER_ERROR" },
          });
        }
      }
    },
    getAdminById: async (_, args) => {
      let id = args.uid.trim();
      let exists = await client.exists(`admin.${id}`);
      if (exists) {
        console.log("admin in cache");
        try {
          let detailAdmin = await client.get(`admin.${id}`);
          return JSON.parse(detailAdmin);
        } catch (e) {
          throw new GraphQLError(e, {
            extensions: { code: "INTERNAL_SERVER_ERROR" },
          });
        }
      } else {
        console.log("admin not in cache");
        try {
          const admin = await users.getUserById(id);
          if (!admin) {
            throw new GraphQLError("Admin Not Found", {
              extensions: { code: "NOT_FOUND" },
            });
          }
          const adminFields = {
            uid: admin.uid,
            name: admin.name
          };
          await client.set(`admin.${id}`, JSON.stringify(adminFields));
          return adminFields;
        } catch (e) {
          throw new GraphQLError(e, {
            extensions: { code: "INTERNAL_SERVER_ERROR" },
          });
        }
      }
    },
    apartments: async (_, args) => {
      let exists = await client.exists("apartments");
      if (exists) {
        console.log("apartments in cache");
        try {
          let allApartments = await client.get("apartments");
          return JSON.parse(allApartments);
        } catch (e) {
          throw new GraphQLError(`Internal Server Error`, {
            extensions: { code: "INTERNAL_SERVER_ERROR" },
          });
        }
      } else {
        try {
          const allApartments = await apartments.getAllApartments();
          if (!allApartments) {
            throw new GraphQLError(`Internal Server Error`, {
              extensions: { code: "INTERNAL_SERVER_ERROR" },
            });
          }
          await client.set("apartments", JSON.stringify(apartments));
          await client.expire("apartments", 3600);
          return apartments;
        } catch (e) {
          throw new GraphQLError(`Internal Server Error`, {
            extensions: { code: "INTERNAL_SERVER_ERROR" },
          });
        }
      }
    },
    getApartmentById: async (_, args) => {
      let id = args.uid.trim();
      let exists = await client.exists(`apartment.${id}`);
      if (exists) {
        console.log("apartment in cache");
        try {
          let detailApartment = await client.get(`apartment.${id}`);
          return JSON.parse(detailApartment);
        } catch (e) {
          throw new GraphQLError(e, {
            extensions: { code: "INTERNAL_SERVER_ERROR" },
          });
        }
      } else {
        console.log("apartment not in cache");
        try {
          const apartment = await apartments.getApartmentById(id);
          if (!apartment) {
            throw new GraphQLError("Apartment Not Found", {
              extensions: { code: "NOT_FOUND" },
            });
          }
          await client.set(`apartment.${id}`, JSON.stringify(apartment));
          return apartment;
        } catch (e) {
          throw new GraphQLError(e, {
            extensions: { code: "INTERNAL_SERVER_ERROR" },
          });
        }
      }
    },
    getUserAccountType: async (_, args) => {
      const retievedUser = await users.getUserById(args.uid);
      console.log("retirevedUser", retievedUser.accountType);
      return retievedUser.accountType;
    },
    reviews: async (_, args) => {
      let allReviews;
      try {
        allReviews = await reviews.getAllReviewsByPosterId(args.posterId);
        if (!allReviews)
          throw new GraphQLError("Review Not Found", {
            extensions: { code: "NOT_FOUND" },
          });
      } catch (e) {
        throw new GraphQLError(`Internal Server Error`);
      }
      return allReviews;
    },
  },
  Mutation: {
    addRenter: async (_, args) => {
      try {
        const newUser = await users.createUser(
          args.uid,
          args.name,
          args.email,
          args.city,
          args.state,
          args.dateOfBirth,
          args.gender,
          "renter"
        );
        return {
          uid: newUser.uid,
          name: newUser.name,
          dateOfBirth: newUser.dateOfBirth,
          gender: newUser.gender,
          savedApartments: newUser.bookmarkedApartments,
        };
      } catch (e) {
        throw new GraphQLError(`Internal Server Error`);
      }
    },
    addLandlord: async (_, args) => {
      try {
        const newUser = await users.createUser(
          args.uid,
          args.name,
          args.email,
          args.city,
          args.state,
          args.dateOfBirth,
          args.gender,
          "landlord"
        );
        return {
          uid: newUser.uid,
          name: newUser.name,
          contactInfo: newUser.email,
          ownedApartments: newUser.bookmarkedApartments,
        };
      } catch (e) {
        throw new GraphQLError(e.message);
      }
    },
    addAdmin: async(_, args) => {
      try {
        const newUser = await users.createUser(
          args.uid,
          args.name,
          args.email,
          args.city,
          args.state,
          args.dateOfBirth,
          args.gender,
          "admin"
        );
        return {
          uid: newUser.uid,
          name: newUser.name,
        };
      } catch (e) {
        throw new GraphQLError(`Internal Server Error`);
      }
    },
    editRenter: async (_, args) => {
      let editedRenter;
      try {
        let renterId = validation.checkString(args.uid);
        const renter = await users.getUserById(renterId);
        if (renter) {
          if (args.name) {
            renter.name = validation.checkName(args.name, "name");
          }
          if (args.email) {
            renter.email = validation.checkString(args.email, "email");
          }
          if (args.password) {
            renter.password = args.password;
          }
          if (args.city) {
            renter.city = args.city;
          }
          if (args.state) {
            renter.state = args.state;
          }
          if (args.dateOfBirth) {
            renter.dateOfBirth = args.dateOfBirth;
          }
          editedRenter = await users.updateUserInfoById(
            renterId,
            renter.name,
            renter.email,
            renter.password,
            renter.city,
            renter.state,
            renter.dateOfBirth
          );
        } else
          throw new GraphQLError(
            `Can't find renter with an Id of ${args.uid}`,
            {
              extensions: { code: "NOT_FOUND" },
            }
          );
      } catch (e) {
        throw new GraphQLError(e, {
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
      }
      return editedRenter;
    },
    removeRenter: async (_, args) => {
      let renterId;
      try {
        renterId = validation.checkString(args.uid, "remove renterId");
      } catch (e) {
        throw new GraphQLError(e, {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }
      try {
        if (await client.exists(`renters`)) {
          client.del(`renter.${renterId}`);
          client.del("renters");
        }
      } catch (e) {
        throw new GraphQLError(e, {
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
      }
      try {
        removedRenter = await users.deleteUserById(renterId);
        return removedRenter;
      } catch (e) {
        throw new GraphQLError(e, {
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
      }
    },
    addApartment: async (_, args) => {
      let apartment = {};
      try {
        apartment.name = validation.checkName(args.name, "apartment name");
        apartment.description = validation.checkString(
          args.description,
          "apartment description"
        );
        apartment.address = validation.checkString(
          args.address,
          "apartment address"
        );
        apartment.city = validation.checkString(args.city, "apartment city");
        apartment.dateListed = new Date().toLocaleDateString();
        apartment.amenities = args.amenities;
        apartment.images = args.images;
        apartment.pricePerMonth = args.pricePerMonth;
        apartment.landlordId = args.landlordId;
        apartment.rating = args.rating;
        apartment.isApproved = false;
      } catch (e) {
        throw new GraphQLError(e, {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }
      try {
        let landlord = await users.getUserById(apartment.landlordId);
        if (!landlord) throw "can't find";
      } catch (e) {
        throw new GraphQLError(
          `Could not find landlord with an Id of ${apartment.landlordId}`,
          {
            extensions: { code: "NOT_FOUND" },
          }
        );
      }
      try {
        let newApartment = await apartments.createApartment(
          apartment.name,
          apartment.description,
          apartment.address,
          apartment.city,
          apartment.state,
          apartment.dateListed,
          apartment.amenities,
          apartment.images,
          apartment.pricePerMonth,
          apartment.landlordId,
          apartment.rating,
          apartment.isApproved
        );
        await client.set(
          `apartment.${newApartment.uid}`,
          JSON.stringify(newApartment)
        );
        return newApartment;
      } catch (e) {
        throw new GraphQLError(e, {
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
      }
    },
    removeApartment: async (_, args) => {
      let id = validation.checkId(args.id, "apartment id");
      let removedApartment;
      try {
        removedApartment = await apartments.deleteApartmentById(id);
      } catch (e) {
        new GraphQLError(`Could not delete apartment with uid of ${args.uid}`, {
          extensions: { code: "NOT_FOUND" },
        });
      }
      try {
        let landlord = await users.getUserById(removedApartment.landlordId);
        await client.del(`apartment.${removedApartment.uid}`);
        await client.del(`apartments`);
      } catch (e) {
        throw new GraphQLError(e, {
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
      }
    },
  },
};
