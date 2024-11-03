-- Add migration script here
create table guests (
    id serial primary key
);

create table notes (
    id serial primary key,
    guest_id integer references guests(id) not null,
    date date not null,
    content text not null
);