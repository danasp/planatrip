# coding=utf-8

from django.shortcuts import render_to_response, render
from django.http import HttpResponse, HttpResponseRedirect, Http404
from django.core.context_processors import csrf
from django.core.urlresolvers import reverse
from django.contrib.auth.models import User
from django.contrib import auth

from user_aa.forms import Join, Login

def join(request):

    form = Join(request.POST or None)
    if request.method == "POST":
        if form.is_valid():
            form.save()
            return HttpResponse("OK")
        else:
           return HttpResponse(form.errors)

    args = {}
    args.update(csrf(request))
    args['form'] = form

    return render_to_response('join.html', args)


def login(request):

    form = Login(request or None)
    if request.method == "POST":
        username = request.POST['username']
        password = request.POST['password']
        user = auth.authenticate(username=username, password=password)
        if user is not None:
            if user.is_active:
                auth.login(request, user)
                return HttpResponseRedirect(reverse('index'))
            else:
                return HttpResponse('Auth Error')
        else:
            return HttpResponse("Что-то не так с акаунтом")
    args = {}
    args.update(csrf(request))
    args['form'] = form
    return render_to_response ('login.html', args)

def logout(request):

    if request.user.is_authenticated():
        auth.logout(request)
        return HttpResponseRedirect(reverse('index'))
    else:
        return HttpResponse("Вы не залогинены")
